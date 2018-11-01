'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { metric } = require('../../lib/text-formatters')
const {
  downloadCount: downloadCountColor,
} = require('../../lib/color-formatters')

module.exports = class PackagistDownloads extends LegacyService {
  static get category() {
    return 'downloads'
  }

  static get url() {
    return {
      base: 'packagist',
    }
  }

  static get examples() {
    return [
      {
        title: 'Packagist',
        previewUrl: 'dm/doctrine/orm',
        keywords: ['PHP'],
      },
      {
        title: 'Packagist',
        previewUrl: 'dd/doctrine/orm',
        keywords: ['PHP'],
      },
      {
        title: 'Packagist',
        previewUrl: 'dt/doctrine/orm',
        keywords: ['PHP'],
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/packagist\/(dm|dd|dt)\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const info = match[1] // either `dm` or dt`.
        const userRepo = match[2] // eg, `doctrine/orm`.
        const format = match[3]
        const apiUrl = 'https://packagist.org/packages/' + userRepo + '.json'
        const badgeData = getBadgeData('downloads', data)
        if (userRepo.substr(-14) === '/:package_name') {
          badgeData.text[1] = 'invalid'
          return sendBadge(format, badgeData)
        }
        request(apiUrl, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)
            let downloads
            switch (info.charAt(1)) {
              case 'm':
                downloads = data.package.downloads.monthly
                badgeData.text[1] = metric(downloads) + '/month'
                break
              case 'd':
                downloads = data.package.downloads.daily
                badgeData.text[1] = metric(downloads) + '/day'
                break
              case 't':
                downloads = data.package.downloads.total
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
