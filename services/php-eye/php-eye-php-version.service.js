'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const {
  versionReduction: phpVersionReduction,
  getPhpReleases,
} = require('../../lib/php-version')
const log = require('../../lib/log')

module.exports = class PhpEyePhpVersion extends LegacyService {
  static get category() {
    return 'version'
  }

  static get url() {
    return {
      base: 'php-eye',
    }
  }

  static get examples() {
    return [
      {
        title: 'PHP version from PHP-Eye',
        previewUrl: 'symfony/symfony',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    camp.route(
      /^\/php-eye\/([^/]+\/[^/]+)(?:\/([^/]+))?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const userRepo = match[1] // eg, espadrine/sc
        const version = match[2] || 'dev-master'
        const format = match[3]
        const options = {
          method: 'GET',
          uri: 'https://php-eye.com/api/v1/package/' + userRepo + '.json',
        }
        const badgeData = getBadgeData('php tested', data)
        getPhpReleases(githubApiProvider)
          .then(phpReleases => {
            request(options, (err, res, buffer) => {
              if (err !== null) {
                log.error('PHP-Eye error: ' + err.stack)
                if (res) {
                  log.error('' + res)
                }
                badgeData.text[1] = 'invalid'
                sendBadge(format, badgeData)
                return
              }

              try {
                const data = JSON.parse(buffer)
                const travis = data.versions.filter(
                  release => release.name === version
                )[0].travis

                if (!travis.config_exists) {
                  badgeData.colorscheme = 'red'
                  badgeData.text[1] = 'not tested'
                  sendBadge(format, badgeData)
                  return
                }

                const versions = []
                for (const index in travis.runtime_status) {
                  if (
                    travis.runtime_status[index] === 3 &&
                    index.match(/^php\d\d$/) !== null
                  ) {
                    versions.push(index.replace(/^php(\d)(\d)$/, '$1.$2'))
                  }
                }

                let reduction = phpVersionReduction(versions, phpReleases)

                if (travis.runtime_status.hhvm === 3) {
                  reduction += reduction ? ', ' : ''
                  reduction += 'HHVM'
                }

                if (reduction) {
                  badgeData.colorscheme = 'brightgreen'
                  badgeData.text[1] = reduction
                } else if (!versions.length) {
                  badgeData.colorscheme = 'red'
                  badgeData.text[1] = 'not tested'
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
