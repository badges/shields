'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class BowerVersion extends LegacyService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'bower',
    }
  }

  static get examples() {
    return [
      {
        title: 'Bower',
        previewUrl: 'v/bootstrap',
      },
      {
        title: 'Bower Pre Release',
        previewUrl: 'vpre/bootstrap',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/bower\/(v|vpre)\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const reqType = match[1]
        const repo = match[2] // eg, `bootstrap`.
        const format = match[3]
        const badgeData = getBadgeData('bower', data)

        // API doc: https://libraries.io/api#project
        const options = {
          method: 'GET',
          json: true,
          uri: `https://libraries.io/api/bower/${repo}`,
        }

        request(options, (err, res, data) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          if (res.statusCode !== 200) {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
            return
          }
          try {
            //if reqType is `v`, then stable release number, if `vpre` then latest release
            const version =
              reqType === 'v'
                ? data.latest_stable_release.name
                : data.latest_release_number
            badgeData.text[1] = versionText(version)
            badgeData.colorscheme = versionColor(version)
            sendBadge(format, badgeData)
          } catch (e) {
            badgeData.text[1] = 'no releases'
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
