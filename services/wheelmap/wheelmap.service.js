'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')

module.exports = class Wheelmap extends LegacyService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'wheelmap/a',
    }
  }

  static get examples() {
    return [
      {
        title: 'Wheelmap',
        previewUrl: '2323004600',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/wheelmap\/a\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const nodeId = match[1] // eg, `2323004600`.
        const format = match[2]
        const options = {
          method: 'GET',
          json: true,
          uri: `http://wheelmap.org/nodes/${nodeId}.json`,
        }
        const badgeData = getBadgeData('wheelmap', data)
        // eslint-disable-next-line handle-callback-err
        request(options, (err, res, json) => {
          try {
            const accessibility = json.node.wheelchair
            badgeData.text[1] = accessibility
            if (accessibility === 'yes') {
              badgeData.colorscheme = 'brightgreen'
            } else if (accessibility === 'limited') {
              badgeData.colorscheme = 'yellow'
            } else if (accessibility === 'no') {
              badgeData.colorscheme = 'red'
            }
            sendBadge(format, badgeData)
          } catch (e) {
            badgeData.text[1] = 'void'
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
