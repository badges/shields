'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLabel: getLabel,
} = require('../../lib/badge-data')
const { metric, starRating } = require('../../lib/text-formatters')
const {
  floorCount: floorCountColor,
  downloadCount: downloadCountColor,
} = require('../../lib/color-formatters')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')

//To generate API request Options for VS Code marketplace
function getVscodeApiReqOptions(packageName) {
  return {
    method: 'POST',
    url:
      'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery/',
    headers: {
      accept: 'application/json;api-version=3.0-preview.1',
      'content-type': 'application/json',
    },
    body: {
      filters: [
        {
          criteria: [{ filterType: 7, value: packageName }],
        },
      ],
      flags: 914,
    },
    json: true,
  }
}

//To extract Statistics (Install/Rating/RatingCount) from respose object for vscode marketplace
function getVscodeStatistic(data, statisticName) {
  const statistics = data.results[0].extensions[0].statistics
  try {
    const statistic = statistics.find(
      x => x.statisticName.toLowerCase() === statisticName.toLowerCase()
    )
    return statistic.value
  } catch (err) {
    return 0 //In case required statistic is not found means ZERO.
  }
}

class VscodeMarketplaceDownloads extends LegacyService {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'vscode-marketplace/d',
    }
  }

  static get examples() {
    return [
      {
        title: 'Visual Studio Marketplace',
        previewUrl: 'ritwickdey.LiveServer',
        keywords: ['vscode-marketplace'],
      },
    ]
  }

  static registerLegacyRouteHandler() {}
}

class VscodeMarketplaceRating extends LegacyService {
  static get category() {
    return 'rating'
  }

  static get route() {
    return {
      base: 'vscode-marketplace',
    }
  }

  static get examples() {
    return [
      {
        title: 'Visual Studio Marketplace',
        previewUrl: 'r/ritwickdey.LiveServer',
        keywords: ['vscode-marketplace'],
      },
      {
        title: 'Visual Studio Marketplace',
        previewUrl: 'stars/ritwickdey.LiveServer',
        keywords: ['vscode-marketplace'],
      },
    ]
  }

  static registerLegacyRouteHandler() {}
}

class VscodeMarketplaceVersion extends LegacyService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'vscode-marketplace/v',
    }
  }

  static get examples() {
    return [
      {
        title: 'Visual Studio Marketplace',
        previewUrl: 'ritwickdey.LiveServer',
        keywords: ['vscode-marketplace'],
      },
    ]
  }

  static registerLegacyRouteHandler() {}
}

class VscodeMarketplace extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/vscode-marketplace\/(d|v|r|stars)\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const reqType = match[1] // eg, d/v/r
        const repo = match[2] // eg, `ritwickdey.LiveServer`.
        const format = match[3]

        const badgeData = getBadgeData('vscode-marketplace', data) //temporary name
        const options = getVscodeApiReqOptions(repo)

        request(options, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }

          try {
            switch (reqType) {
              case 'd': {
                badgeData.text[0] = getLabel('downloads', data)
                const count = getVscodeStatistic(buffer, 'install')
                badgeData.text[1] = metric(count)
                badgeData.colorscheme = downloadCountColor(count)
                break
              }
              case 'r': {
                badgeData.text[0] = getLabel('rating', data)
                const rate = getVscodeStatistic(
                  buffer,
                  'averagerating'
                ).toFixed(2)
                const totalrate = getVscodeStatistic(buffer, 'ratingcount')
                badgeData.text[1] = `${rate}/5 (${totalrate})`
                badgeData.colorscheme = floorCountColor(rate, 2, 3, 4)
                break
              }
              case 'stars': {
                badgeData.text[0] = getLabel('rating', data)
                const rating = getVscodeStatistic(
                  buffer,
                  'averagerating'
                ).toFixed(2)
                badgeData.text[1] = starRating(rating)
                badgeData.colorscheme = floorCountColor(rating, 2, 3, 4)
                break
              }
              case 'v': {
                badgeData.text[0] = getLabel('visual studio marketplace', data)
                const version =
                  buffer.results[0].extensions[0].versions[0].version
                badgeData.text[1] = versionText(version)
                badgeData.colorscheme = versionColor(version)
                break
              }
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
  VscodeMarketplaceDownloads,
  VscodeMarketplaceRating,
  VscodeMarketplaceVersion,
  VscodeMarketplace,
}
