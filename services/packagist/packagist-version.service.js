'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')
const { getLatestVersion } = require('./packagist-helpers')

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
    }
  }

  static get examples() {
    return [
      {
        title: 'Packagist',
        previewUrl: 'v/symfony/symfony',
        keywords: ['PHP'],
      },
      {
        title: 'Packagist Pre Release',
        previewUrl: 'vpre/symfony/symfony',
        keywords: ['PHP'],
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
            const stable = info === 'v'
            const version = getLatestVersion(data.package.versions, stable)
            const badgeText = versionText(version)
            const badgeColor = stable ? versionColor(version) : 'orange'

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
