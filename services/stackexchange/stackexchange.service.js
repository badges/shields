'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLabel: getLabel,
} = require('../../lib/badge-data')
const { metric } = require('../../lib/text-formatters')
const { floorCount: floorCountColor } = require('../../lib/color-formatters')

class StackExchangeReputation extends LegacyService {
  static get category() {
    return 'rating'
  }

  static get route() {
    return {
      base: 'stackexchange',
    }
  }

  static get examples() {
    return [
      {
        title: 'StackExchange',
        previewUrl: 'tex/r/951',
      },
    ]
  }

  static registerLegacyRouteHandler() {}
}

class StackExchangeQuestions extends LegacyService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'stackexchange',
    }
  }

  static get examples() {
    return [
      {
        title: 'StackExchange',
        previewUrl: 'stackoverflow/t/augeas',
      },
    ]
  }

  static registerLegacyRouteHandler() {}
}

class StackExchange extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/stackexchange\/([^/]+)\/([^/])\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const site = match[1] // eg, stackoverflow
        const info = match[2] // either `r`
        const item = match[3] // eg, 232250
        const format = match[4]
        let path
        if (info === 'r') {
          path = `users/${item}`
        } else if (info === 't') {
          path = `tags/${item}/info`
        }
        const options = {
          method: 'GET',
          uri: `https://api.stackexchange.com/2.2/${path}?site=${site}`,
          gzip: true,
        }
        const badgeData = getBadgeData(site, data)
        request(options, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            const parsedData = JSON.parse(buffer.toString())

            // IP rate limiting
            if (parsedData.error_name === 'throttle_violation') {
              return // Hope for the best in the cache.
            }

            if (info === 'r') {
              const reputation = parsedData.items[0].reputation
              badgeData.text[0] = getLabel(`${site} reputation`, data)
              badgeData.text[1] = metric(reputation)
              badgeData.colorscheme = floorCountColor(1000, 10000, 20000)
            } else if (info === 't') {
              const count = parsedData.items[0].count
              badgeData.text[0] = getLabel(`${site} ${item} questions`, data)
              badgeData.text[1] = metric(count)
              badgeData.colorscheme = floorCountColor(1000, 10000, 20000)
            }
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

module.exports = {
  StackExchangeReputation,
  StackExchangeQuestions,
  StackExchange,
}
