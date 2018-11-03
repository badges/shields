'use strict'

const xml2js = require('xml2js')
const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLabel: getLabel,
} = require('../../lib/badge-data')
const {
  metric,
  starRating,
  addv: versionText,
} = require('../../lib/text-formatters')
const {
  version: versionColor,
  downloadCount: downloadCountColor,
  floorCount: floorCountColor,
} = require('../../lib/color-formatters')

module.exports = class Amo extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/amo\/(v|d|rating|stars|users)\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((queryData, match, sendBadge, request) => {
        const type = match[1]
        const addonId = match[2]
        const format = match[3]
        const badgeData = getBadgeData('mozilla add-on', queryData)
        const url = `https://services.addons.mozilla.org/api/1.5/addon/${addonId}`

        request(url, (err, res, buffer) => {
          if (err) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }

          xml2js.parseString(buffer.toString(), (err, data) => {
            if (err) {
              badgeData.text[1] = 'invalid'
              sendBadge(format, badgeData)
              return
            }

            try {
              let rating
              switch (type) {
                case 'v': {
                  const version = data.addon.version[0]
                  badgeData.text[1] = versionText(version)
                  badgeData.colorscheme = versionColor(version)
                  break
                }
                case 'd': {
                  const downloads = parseInt(data.addon.total_downloads[0], 10)
                  badgeData.text[0] = getLabel('downloads', queryData)
                  badgeData.text[1] = metric(downloads)
                  badgeData.colorscheme = downloadCountColor(downloads)
                  break
                }
                case 'rating':
                  rating = parseInt(data.addon.rating, 10)
                  badgeData.text[0] = getLabel('rating', queryData)
                  badgeData.text[1] = `${rating}/5`
                  badgeData.colorscheme = floorCountColor(rating, 2, 3, 4)
                  break
                case 'stars':
                  rating = parseInt(data.addon.rating, 10)
                  badgeData.text[0] = getLabel('stars', queryData)
                  badgeData.text[1] = starRating(rating)
                  badgeData.colorscheme = floorCountColor(rating, 2, 3, 4)
                  break
                case 'users': {
                  const dailyUsers = parseInt(data.addon.daily_users[0], 10)
                  badgeData.text[0] = getLabel('users', queryData)
                  badgeData.text[1] = metric(dailyUsers)
                  badgeData.colorscheme = 'brightgreen'
                  break
                }
              }

              sendBadge(format, badgeData)
            } catch (err) {
              badgeData.text[1] = 'invalid'
              sendBadge(format, badgeData)
            }
          })
        })
      })
    )
  }
}
