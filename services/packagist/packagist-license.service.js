'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')

module.exports = class PackagistLicense extends LegacyService {
  static get category() {
    return 'license'
  }

  static get route() {
    return {
      base: 'packagist/l',
    }
  }

  static get examples() {
    return [
      {
        title: 'Packagist',
        previewUrl: 'doctrine/orm',
        keywords: ['PHP'],
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/packagist\/l\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const userRepo = match[1]
        const format = match[2]
        const apiUrl = `https://packagist.org/packages/${userRepo}.json`
        const badgeData = getBadgeData('license', data)
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
            // Note: if you change the latest version detection algorithm here,
            // change it above (for the actual version badge).
            let version
            const unstable = function(ver) {
              return /dev/.test(ver)
            }
            // Grab the latest stable version, or an unstable
            for (const versionName in data.package.versions) {
              const current = data.package.versions[versionName]

              if (version !== undefined) {
                if (unstable(version.version) && !unstable(current.version)) {
                  version = current
                } else if (
                  version.version_normalized < current.version_normalized
                ) {
                  version = current
                }
              } else {
                version = current
              }
            }
            badgeData.text[1] = version.license[0]
            badgeData.colorscheme = 'blue'
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
