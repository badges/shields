'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const log = require('../../core/server/log')
const {
  minorVersion: phpMinorVersion,
  versionReduction: phpVersionReduction,
  getPhpReleases,
} = require('../../lib/php-version')

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class TravisPhpVersion extends LegacyService {
  static get category() {
    return 'platform-support'
  }

  static get route() {
    return {
      base: 'travis/php-v',
      pattern: ':user/:repo',
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'php',
    }
  }

  static get examples() {
    return [
      {
        title: 'PHP from Travis config',
        namedParams: { user: 'symfony', repo: 'symfony' },
        staticPreview: { message: '^7.1.3', color: 'blue' },
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    camp.route(
      /^\/travis(?:-ci)?\/php-v\/([^/]+\/[^/]+)(?:\/([^/]+))?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const userRepo = match[1] // eg, espadrine/sc
        const version = match[2] || 'master'
        const format = match[3]
        const options = {
          method: 'GET',
          uri: `https://api.travis-ci.org/repos/${userRepo}/branches/${version}`,
        }
        const badgeData = getBadgeData('php', data)
        getPhpReleases(githubApiProvider)
          // Switch to async/await when this is refactored.
          // eslint-disable-next-line promise/prefer-await-to-then
          .then(phpReleases => {
            request(options, (err, res, buffer) => {
              if (err !== null) {
                log.error(`Travis CI error: ${err.stack}`)
                if (res) {
                  log.error(`${res}`)
                }
                badgeData.text[1] = 'invalid'
                sendBadge(format, badgeData)
                return
              }

              try {
                const data = JSON.parse(buffer)
                let travisVersions = []

                // from php
                if (typeof data.branch.config.php !== 'undefined') {
                  travisVersions = travisVersions.concat(
                    data.branch.config.php.map(v => v.toString())
                  )
                }
                // from matrix
                if (typeof data.branch.config.matrix.include !== 'undefined') {
                  travisVersions = travisVersions.concat(
                    data.branch.config.matrix.include.map(v => v.php.toString())
                  )
                }

                const hasHhvm = travisVersions.find(v => v.startsWith('hhvm'))
                const versions = travisVersions
                  .map(v => phpMinorVersion(v))
                  .filter(v => v.indexOf('.') !== -1)
                let reduction = phpVersionReduction(versions, phpReleases)

                if (hasHhvm) {
                  reduction += reduction ? ', ' : ''
                  reduction += 'HHVM'
                }

                if (reduction) {
                  badgeData.colorscheme = 'blue'
                  badgeData.text[1] = reduction
                } else {
                  badgeData.text[1] = 'invalid'
                }
              } catch (e) {
                badgeData.text[1] = 'invalid'
              }
              sendBadge(format, badgeData)
            })
          })
          .catch(() => {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
          })
      })
    )
  }
}
