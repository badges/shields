'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')

// For Chef cookbook.
module.exports = class Cookbook extends LegacyService {
  static get category() {
    return 'version'
  }

  static get url() {
    return { base: 'cookbook/v' }
  }

  static get examples() {
    return [
      {
        title: 'Chef cookbook',
        previewUrl: 'chef-sugar',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/cookbook\/v\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const cookbook = match[1] // eg, chef-sugar
        const format = match[2]
        const apiUrl = `https://supermarket.getchef.com/api/v1/cookbooks/${cookbook}/versions/latest`
        const badgeData = getBadgeData('cookbook', data)

        request(apiUrl, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }

          try {
            const data = JSON.parse(buffer)
            const version = data.version
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
