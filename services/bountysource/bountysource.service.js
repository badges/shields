'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')

module.exports = class Bountysource extends LegacyService {
  static get category() {
    return 'funding'
  }

  static get url() {
    return {
      base: 'bountysource',
    }
  }

  static get examples() {
    return [
      {
        title: 'Bountysource',
        previewUrl: 'team/mozilla-core/activity',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/bountysource\/team\/([^/]+)\/activity\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const team = match[1] // eg, `mozilla-core`.
        const format = match[2]
        const url = 'https://api.bountysource.com/teams/' + team
        const options = {
          headers: { Accept: 'application/vnd.bountysource+json; version=2' },
        }
        const badgeData = getBadgeData('bounties', data)
        request(url, options, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            if (res.statusCode !== 200) {
              throw Error('Bad response.')
            }
            const parsedData = JSON.parse(buffer)
            const activity = parsedData.activity_total
            badgeData.colorscheme = 'brightgreen'
            badgeData.text[1] = activity
            sendBadge(format, badgeData)
          } catch (e) {
            if (res.statusCode === 404) {
              badgeData.text[1] = 'not found'
            } else {
              badgeData.text[1] = 'invalid'
            }
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
