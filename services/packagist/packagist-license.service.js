'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { getLatestVersion } = require('./packagist-helpers')

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
            const version =
              data.package.versions[getLatestVersion(data.package.versions)]
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
