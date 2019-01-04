'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')
const { latest: latestVersion } = require('../../lib/version')

// For Dart's pub.
//
// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class Pub extends LegacyService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'pub',
    }
  }

  static get examples() {
    return [
      {
        title: 'Pub',
        previewUrl: 'v/box2d',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/pub\/v(pre)?\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const includePre = Boolean(match[1])
        const userRepo = match[2] // eg, "box2d"
        const format = match[3]
        const apiUrl = `https://pub.dartlang.org/packages/${userRepo}.json`
        const badgeData = getBadgeData('pub', data)
        request(apiUrl, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)
            // Grab the latest stable version, or an unstable
            const versions = data.versions
            const version = latestVersion(versions, { pre: includePre })
            badgeData.text[1] = versionText(version)
            badgeData.colorscheme = versionColor(version)
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
