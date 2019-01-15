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

const keywords = ['amo', 'firefox']

class AmoDownloads extends LegacyService {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'amo/d',
      pattern: ':addonId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Mozilla Add-on',
        namedParams: { addonId: 'dustman' },
        staticPreview: { message: '12k', color: 'brightgreen' },
        keywords,
      },
    ]
  }

  static registerLegacyRouteHandler() {}
}

class AmoVersion extends LegacyService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'amo/v',
      pattern: ':addonId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Mozilla Add-on',
        namedParams: { addonId: 'dustman' },
        staticPreview: { message: 'v2.1.0', color: 'blue' },
        keywords,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'mozilla add-on',
    }
  }

  static registerLegacyRouteHandler() {}
}

class AmoRating extends LegacyService {
  static get category() {
    return 'rating'
  }

  static get route() {
    return {
      base: 'amo',
    }
  }

  static get examples() {
    return [
      {
        title: 'Mozilla Add-on',
        pattern: 'rating/:addonId',
        namedParams: { addonId: 'dustman' },
        staticPreview: {
          label: 'rating',
          message: '4/5',
          color: 'brightgreen',
        },
        keywords,
      },
      {
        title: 'Mozilla Add-on',
        pattern: 'stars/:addonId',
        namedParams: { addonId: 'dustman' },
        staticPreview: {
          label: 'rating',
          message: starRating(4),
          color: 'brightgreen',
        },
        keywords,
      },
    ]
  }

  static registerLegacyRouteHandler() {}
}

class AmoUsers extends LegacyService {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'amo/users',
      pattern: ':addonId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Mozilla Add-on',
        namedParams: { addonId: 'dustman' },
        staticPreview: { message: '706', color: 'brightgreen' },
        keywords,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'users',
    }
  }

  static registerLegacyRouteHandler() {}
}

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
class Amo extends LegacyService {
  static get category() {
    return 'other'
  }

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

module.exports = {
  AmoDownloads,
  AmoVersion,
  AmoRating,
  AmoUsers,
  Amo,
}
