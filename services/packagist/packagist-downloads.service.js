'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { metric } = require('../text-formatters')
const { downloadCount: downloadCountColor } = require('../color-formatters')

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class PackagistDownloads extends LegacyService {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'packagist',
      pattern: ':interval(dm|dd|dt)/:user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'Packagist',
        namedParams: {
          interval: 'dm',
          user: 'doctrine',
          repo: 'orm',
        },
        staticPreview: {
          label: 'downloads',
          message: '1M/month',
          color: 'brightgreen',
        },
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
        const apiUrl = `https://packagist.org/packages/${userRepo}.json`
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
                badgeData.text[1] = `${metric(downloads)}/month`
                break
              case 'd':
                downloads = data.package.downloads.daily
                badgeData.text[1] = `${metric(downloads)}/day`
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
