'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { metric } = require('../../lib/text-formatters')
const {
  downloadCount: downloadCountColor,
} = require('../../lib/color-formatters')

module.exports = class PackageControl extends LegacyService {
  static get category() {
    return 'downloads'
  }

  static get url() {
    return {
      base: 'packagecontrol',
    }
  }

  static get examples() {
    return [
      {
        title: 'Package Control',
        previewUrl: 'dm/GitGutter',
        keywords: ['sublime'],
      },
      {
        title: 'Package Control',
        previewUrl: 'dw/GitGutter',
        keywords: ['sublime'],
      },
      {
        title: 'Package Control',
        previewUrl: 'dd/GitGutter',
        keywords: ['sublime'],
      },
      {
        title: 'Package Control',
        previewUrl: 'dt/GitGutter',
        keywords: ['sublime'],
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/packagecontrol\/(dm|dw|dd|dt)\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const info = match[1] // either `dm`, `dw`, `dd` or dt`.
        const userRepo = match[2] // eg, `Package%20Control`.
        const format = match[3]
        const apiUrl =
          'https://packagecontrol.io/packages/' + userRepo + '.json'
        const badgeData = getBadgeData('downloads', data)
        request(apiUrl, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)
            let downloads = 0
            let platforms
            switch (info.charAt(1)) {
              case 'm':
                // daily downloads are separated by Operating System
                platforms = data.installs.daily.data
                platforms.forEach(platform => {
                  // loop through the first 30 days or 1 month
                  for (let i = 0; i < 30; i++) {
                    // add the downloads for that day for that platform
                    downloads += platform.totals[i]
                  }
                })
                badgeData.text[1] = metric(downloads) + '/month'
                break
              case 'w':
                // daily downloads are separated by Operating System
                platforms = data.installs.daily.data
                platforms.forEach(platform => {
                  // loop through the first 7 days or 1 week
                  for (let i = 0; i < 7; i++) {
                    // add the downloads for that day for that platform
                    downloads += platform.totals[i]
                  }
                })
                badgeData.text[1] = metric(downloads) + '/week'
                break
              case 'd':
                // daily downloads are separated by Operating System
                platforms = data.installs.daily.data
                platforms.forEach(platform => {
                  // use the downloads from yesterday
                  downloads += platform.totals[1]
                })
                badgeData.text[1] = metric(downloads) + '/day'
                break
              case 't':
                // all-time downloads are already compiled
                downloads = data.installs.total
                badgeData.text[1] = metric(downloads)
                break
            }
            badgeData.colorscheme = downloadCountColor(downloads)
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
