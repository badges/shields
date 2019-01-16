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

const commonExample = {
  title: 'Chrome Web Store',
  pattern: ':storeId',
  namedParams: { storeId: 'ogffaloegjglncjfehdfplabnoondfjo' },
}

class ChromeWebStoreDownloads extends LegacyService {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'chrome-web-store/users',
    }
  }

  static get examples() {
    return [
      {
        ...commonExample,
        staticPreview: { label: 'users', message: '573', color: 'green' },
      },
    ]
  }

  static registerLegacyRouteHandler() {}
}

class ChromeWebStoreVersion extends LegacyService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'chrome-web-store/v',
    }
  }

  static get examples() {
    return [
      {
        ...commonExample,
        staticPreview: {
          label: 'chrome web store',
          message: 'v1.1.0',
          color: 'blue',
        },
      },
    ]
  }

  static registerLegacyRouteHandler() {}
}

class ChromeWebStorePrice extends LegacyService {
  static get category() {
    return 'funding'
  }

  static get route() {
    return {
      base: 'chrome-web-store/price',
    }
  }

  static get examples() {
    return [
      {
        ...commonExample,
        staticPreview: { label: 'price', message: '$0', color: 'brightgreen' },
      },
    ]
  }

  static registerLegacyRouteHandler() {}
}

class ChromeWebStoreRating extends LegacyService {
  static get category() {
    return 'rating'
  }

  static get route() {
    return {
      base: 'chrome-web-store',
    }
  }

  static get examples() {
    return [
      {
        ...commonExample,
        pattern: 'rating/:storeId',
        staticPreview: { label: 'rating', message: '3.67/5', color: 'green' },
      },
      {
        ...commonExample,
        pattern: 'stars/:storeId',
        staticPreview: {
          label: 'rating',
          message: starRating(3.75),
          color: 'green',
        },
      },
      {
        ...commonExample,
        pattern: 'rating-count/:storeId',
        staticPreview: {
          label: 'rating',
          message: '12 total',
          color: 'yellowgreen',
        },
      },
    ]
  }

  static registerLegacyRouteHandler() {}
}

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
class ChromeWebStore extends LegacyService {
  static get category() {
    return 'other'
  }

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
            // Switch to async/await when this is refactored.
            // eslint-disable-next-line promise/prefer-await-to-then
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

module.exports = {
  ChromeWebStoreDownloads,
  ChromeWebStoreVersion,
  ChromeWebStorePrice,
  ChromeWebStoreRating,
  ChromeWebStore,
}
