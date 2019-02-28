'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { addv: versionText } = require('../text-formatters')
const { version: versionColor } = require('../color-formatters')
const {
  compare: phpVersionCompare,
  latest: phpLatestVersion,
  isStable: phpStableVersion,
} = require('../php-version')

const keywords = ['PHP']

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class PackagistVersion extends LegacyService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'packagist',
      pattern: ':which(v|vpre)/:user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'Packagist',
        pattern: 'v/:user/:repo',
        namedParams: {
          user: 'symfony',
          repo: 'symfony',
        },
        staticPreview: {
          label: 'packagist',
          message: 'v4.2.2',
          color: 'blue',
        },
        keywords,
      },
      {
        title: 'Packagist Pre Release',
        pattern: 'vpre/:user/:repo',
        namedParams: {
          user: 'symfony',
          repo: 'symfony',
        },
        staticPreview: {
          label: 'packagist',
          message: 'v4.3-dev',
          color: 'orange',
        },
        keywords,
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/packagist\/(v|vpre)\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const info = match[1] // either `v` or `vpre`.
        const userRepo = match[2] // eg, `doctrine/orm`.
        const format = match[3]
        const apiUrl = `https://packagist.org/packages/${userRepo}.json`
        const badgeData = getBadgeData('packagist', data)
        if (userRepo.substr(-14) === '/:package_name') {
          badgeData.text[1] = 'invalid'
          return sendBadge(format, badgeData)
        }
        request(apiUrl, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)

            const versionsData = data.package.versions
            let versions = Object.keys(versionsData)

            // Map aliases (eg, dev-master).
            const aliasesMap = {}
            versions.forEach(version => {
              const versionData = versionsData[version]
              if (
                versionData.extra &&
                versionData.extra['branch-alias'] &&
                versionData.extra['branch-alias'][version]
              ) {
                // eg, version is 'dev-master', mapped to '2.0.x-dev'.
                const validVersion = versionData.extra['branch-alias'][version]
                if (
                  aliasesMap[validVersion] === undefined ||
                  phpVersionCompare(aliasesMap[validVersion], validVersion) < 0
                ) {
                  versions.push(validVersion)
                  aliasesMap[validVersion] = version
                }
              }
            })
            versions = versions.filter(version => !/^dev-/.test(version))

            let badgeText = null
            let badgeColor = null

            switch (info) {
              case 'v': {
                const stableVersions = versions.filter(phpStableVersion)
                let stableVersion = phpLatestVersion(stableVersions)
                if (!stableVersion) {
                  stableVersion = phpLatestVersion(versions)
                }
                //if (!!aliasesMap[stableVersion]) {
                //  stableVersion = aliasesMap[stableVersion];
                //}
                badgeText = versionText(stableVersion)
                badgeColor = versionColor(stableVersion)
                break
              }
              case 'vpre': {
                const unstableVersion = phpLatestVersion(versions)
                //if (!!aliasesMap[unstableVersion]) {
                //  unstableVersion = aliasesMap[unstableVersion];
                //}
                badgeText = versionText(unstableVersion)
                badgeColor = 'orange'
                break
              }
            }

            if (badgeText !== null) {
              badgeData.text[1] = badgeText
              badgeData.colorscheme = badgeColor
            }

            sendBadge(format, badgeData)
          } catch (e) {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
