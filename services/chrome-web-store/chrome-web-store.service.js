'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLabel: getLabel,
} = require('../../lib/badge-data')
const { metric, starRating } = require('../../lib/text-formatters')
const {
  downloadCount: downloadCountColor,
  floorCount: floorCountColor,
  version: versionColor,
} = require('../../lib/color-formatters')
const {
  addv: versionText,
  currencyFromCode,
} = require('../../lib/text-formatters')

module.exports = class ChromeWebStore extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/chrome-web-store\/(v|d|users|price|rating|stars|rating-count)\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const type = match[1]
        const storeId = match[2] // eg, nimelepbpejjlbmoobocpfnjhihnpked
        const format = match[3]
        const badgeData = getBadgeData('chrome web store', data)
        const url = `https://chrome.google.com/webstore/detail/${storeId}?hl=en&gl=US`
        const chromeWebStore = require('chrome-web-store-item-property')
        request(url, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          chromeWebStore
            .convert(buffer)
            .then(value => {
              let rating
              switch (type) {
                case 'v':
                  badgeData.text[1] = versionText(value.version)
                  badgeData.colorscheme = versionColor(value.version)
                  break
                case 'd':
                case 'users': {
                  const downloads = value.interactionCount.UserDownloads
                  badgeData.text[0] = getLabel('users', data)
                  badgeData.text[1] = metric(downloads)
                  badgeData.colorscheme = downloadCountColor(downloads)
                  break
                }
                case 'price':
                  badgeData.text[0] = getLabel('price', data)
                  badgeData.text[1] =
                    currencyFromCode(value.priceCurrency) + value.price
                  badgeData.colorscheme = 'brightgreen'
                  break
                case 'rating':
                  rating = Math.round(value.ratingValue * 100) / 100
                  badgeData.text[0] = getLabel('rating', data)
                  badgeData.text[1] = `${rating}/5`
                  badgeData.colorscheme = floorCountColor(rating, 2, 3, 4)
                  break
                case 'stars':
                  rating = parseFloat(value.ratingValue)
                  badgeData.text[0] = getLabel('rating', data)
                  badgeData.text[1] = starRating(rating)
                  badgeData.colorscheme = floorCountColor(rating, 2, 3, 4)
                  break
                case 'rating-count': {
                  const ratingCount = value.ratingCount
                  badgeData.text[0] = getLabel('rating count', data)
                  badgeData.text[1] = `${metric(ratingCount)} total`
                  badgeData.colorscheme = floorCountColor(
                    ratingCount,
                    5,
                    50,
                    500
                  )
                  break
                }
              }
              sendBadge(format, badgeData)
            })
            // eslint-disable-next-line handle-callback-err
            .catch(err => {
              badgeData.text[1] = 'invalid'
              sendBadge(format, badgeData)
            })
        })
      })
    )
  }
}
