'use strict'

const xml2js = require('xml2js')
const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLabel: getLabel,
} = require('../../lib/badge-data')
const {
  metric,
  addv: versionText,
  formatDate,
} = require('../../lib/text-formatters')
const {
  age: ageColor,
  downloadCount: downloadCountColor,
  version: versionColor,
} = require('../../lib/color-formatters')

module.exports = class EclipseMarketplace extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/eclipse-marketplace\/(dt|dm|v|favorites|last-update)\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const type = match[1]
        const project = match[2]
        const format = match[3]
        const apiUrl =
          'https://marketplace.eclipse.org/content/' + project + '/api/p'
        const badgeData = getBadgeData('eclipse marketplace', data)
        request(apiUrl, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          xml2js.parseString(buffer.toString(), (parseErr, parsedData) => {
            if (parseErr != null) {
              badgeData.text[1] = 'invalid'
              sendBadge(format, badgeData)
              return
            }
            try {
              const projectNode = parsedData.marketplace.node[0]
              switch (type) {
                case 'dt': {
                  badgeData.text[0] = getLabel('downloads', data)
                  const downloads = parseInt(projectNode.installstotal[0])
                  badgeData.text[1] = metric(downloads)
                  badgeData.colorscheme = downloadCountColor(downloads)
                  break
                }
                case 'dm': {
                  badgeData.text[0] = getLabel('downloads', data)
                  const monthlydownloads = parseInt(
                    projectNode.installsrecent[0]
                  )
                  badgeData.text[1] = metric(monthlydownloads) + '/month'
                  badgeData.colorscheme = downloadCountColor(monthlydownloads)
                  break
                }
                case 'v': {
                  badgeData.text[1] = versionText(projectNode.version[0])
                  badgeData.colorscheme = versionColor(projectNode.version[0])
                  break
                }
                case 'favorites': {
                  badgeData.text[0] = getLabel('favorites', data)
                  badgeData.text[1] = parseInt(projectNode.favorited[0])
                  badgeData.colorscheme = 'brightgreen'
                  break
                }
                case 'last-update': {
                  const date = 1000 * parseInt(projectNode.changed[0])
                  badgeData.text[0] = getLabel('updated', data)
                  badgeData.text[1] = formatDate(date)
                  badgeData.colorscheme = ageColor(Date.parse(date))
                  break
                }
                default:
                  throw Error('Unreachable due to regex')
              }
              sendBadge(format, badgeData)
            } catch (e) {
              badgeData.text[1] = 'invalid'
              sendBadge(format, badgeData)
            }
          })
        })
      })
    )
  }
}
