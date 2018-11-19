'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const serverSecrets = require('../../lib/server-secrets')

module.exports = class BowerLicense extends LegacyService {
  static get category() {
    return 'license'
  }

  static get route() {
    return {
      base: 'bower/l',
    }
  }

  static get examples() {
    return [
      {
        title: 'Bower',
        previewUrl: 'bootstrap',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/bower\/l\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const repo = match[1] // eg, `bootstrap`.
        const format = match[2]
        const badgeData = getBadgeData('license', data)
        // API doc: https://libraries.io/api#project
        const options = {
          method: 'GET',
          json: true,
          uri: `https://libraries.io/api/bower/${repo}`,
        }
        if (serverSecrets && serverSecrets.libraries_io_api_key) {
          options.qs = {
            api_key: serverSecrets.libraries_io_api_key,
          }
        }
        request(options, (err, res, data) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            const license = data.normalized_licenses[0]
            badgeData.text[1] = license
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
