'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')

module.exports = class Sourcegraph extends LegacyService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'sourcegraph/rrc',
    }
  }

  static get examples() {
    return [
      {
        title: 'Sourcegraph for Repo Reference Count',
        previewUrl: 'github.com/gorilla/mux',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/sourcegraph\/rrc\/([\s\S]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const repo = match[1]
        const format = match[2]
        const apiUrl = `https://sourcegraph.com/.api/repos/${repo}/-/shield`
        const badgeData = getBadgeData('used by', data)
        request(apiUrl, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            badgeData.colorscheme = 'brightgreen'
            const data = JSON.parse(buffer)
            badgeData.text[1] = data.value
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
