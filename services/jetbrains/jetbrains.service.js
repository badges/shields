'use strict'

const xml2js = require('xml2js')
const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { metric } = require('../../lib/text-formatters')
const {
  downloadCount: downloadCountColor,
} = require('../../lib/color-formatters')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')

// JetBrains Plugins repository integration
module.exports = class JetBrains extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/jetbrains\/plugin\/(d|v)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const pluginId = match[2]
        const type = match[1]
        const format = match[3]
        const leftText = type === 'v' ? 'jetbrains plugin' : 'downloads'
        const badgeData = getBadgeData(leftText, data)
        const url = `https://plugins.jetbrains.com/plugins/list?pluginId=${pluginId}`

        request(url, (err, res, buffer) => {
          if (err || res.statusCode !== 200) {
            badgeData.text[1] = 'inaccessible'
            return sendBadge(format, badgeData)
          }

          xml2js.parseString(buffer.toString(), (err, data) => {
            if (err) {
              badgeData.text[1] = 'invalid'
              return sendBadge(format, badgeData)
            }

            try {
              const plugin = data['plugin-repository'].category
              if (!plugin) {
                badgeData.text[1] = 'not found'
                return sendBadge(format, badgeData)
              }
              switch (type) {
                case 'd': {
                  const downloads = parseInt(
                    data['plugin-repository'].category[0]['idea-plugin'][0]['$']
                      .downloads,
                    10
                  )
                  if (isNaN(downloads)) {
                    badgeData.text[1] = 'invalid'
                    return sendBadge(format, badgeData)
                  }
                  badgeData.text[1] = metric(downloads)
                  badgeData.colorscheme = downloadCountColor(downloads)
                  return sendBadge(format, badgeData)
                }
                case 'v': {
                  const version =
                    data['plugin-repository'].category[0]['idea-plugin'][0]
                      .version[0]
                  badgeData.text[1] = versionText(version)
                  badgeData.colorscheme = versionColor(version)
                  return sendBadge(format, badgeData)
                }
              }
            } catch (err) {
              badgeData.text[1] = 'invalid'
              return sendBadge(format, badgeData)
            }
          })
        })
      })
    )
  }
}
