'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')

module.exports = class Itunes extends LegacyService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'itunes/v',
    }
  }

  static get examples() {
    return [
      {
        title: 'iTunes App Store',
        previewUrl: '803453959',
        pattern: ':bundle-id',
        exampleUrl: '803453959',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/itunes\/v\/(.+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const bundleId = match[1] // eg, `324684580`
        const format = match[2]
        const apiUrl = `https://itunes.apple.com/lookup?id=${bundleId}`
        const badgeData = getBadgeData('itunes app store', data)
        request(apiUrl, (err, res, buffer) => {
          if (err !== null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)
            if (data.resultCount === 0) {
              /* Note the 'not found' response from iTunes is:
           status code = 200,
           body = { "resultCount":0, "results": [] }
        */
              badgeData.text[1] = 'not found'
              sendBadge(format, badgeData)
              return
            }
            const version = data.results[0].version
            badgeData.text[1] = versionText(version)
            badgeData.colorscheme = versionColor(version)
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
