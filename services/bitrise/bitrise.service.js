'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class Bitrise extends LegacyService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'bitrise',
      pattern: ':appId/:branch',
    }
  }

  static get examples() {
    return [
      {
        title: 'Bitrise',
        namedParams: { appId: 'cde737473028420d', branch: 'master' },
        queryParams: { token: 'GCIdEzacE4GW32jLVrZb7A' },
        staticPreview: {
          label: 'bitrise',
          message: 'success',
          color: 'brightgreen',
        },
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/bitrise\/([^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
      cache({
        queryParams: ['token'],
        handler: (data, match, sendBadge, request) => {
          const appId = match[1]
          const branch = match[2]
          const format = match[3]
          const token = data.token
          const badgeData = getBadgeData('bitrise', data)
          let apiUrl = `https://app.bitrise.io/app/${appId}/status.json?token=${token}`
          if (typeof branch !== 'undefined') {
            apiUrl += `&branch=${branch}`
          }

          const statusColorScheme = {
            success: 'brightgreen',
            error: 'red',
            unknown: 'lightgrey',
          }

          request(apiUrl, { json: true }, (err, res, data) => {
            try {
              if (!res || err !== null || res.statusCode !== 200) {
                badgeData.text[1] = 'inaccessible'
                sendBadge(format, badgeData)
                return
              }

              badgeData.text[1] = data.status
              badgeData.colorscheme = statusColorScheme[data.status]

              sendBadge(format, badgeData)
            } catch (e) {
              badgeData.text[1] = 'invalid'
              sendBadge(format, badgeData)
            }
          })
        },
      })
    )
  }
}
