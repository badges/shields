'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLabel: getLabel,
} = require('../../lib/badge-data')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')

module.exports = class Ctan extends LegacyService {
  static get url() {
    return { base: 'ctan' }
  }
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/ctan\/([vl])\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const info = match[1] // either `v` or `l`
        const pkg = match[2] // eg, tex
        const format = match[3]
        const url = 'http://www.ctan.org/json/pkg/' + pkg
        const badgeData = getBadgeData('ctan', data)
        request(url, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          if (res.statusCode === 404) {
            badgeData.text[1] = 'not found'
            sendBadge(format, badgeData)
            return
          }
          try {
            const parsedData = JSON.parse(buffer)

            if (info === 'v') {
              const version = parsedData.version.number
              badgeData.text[1] = versionText(version)
              badgeData.colorscheme = versionColor(version)
              sendBadge(format, badgeData)
            } else if (info === 'l') {
              badgeData.text[0] = getLabel('license', data)
              const license = parsedData.license
              if (Array.isArray(license) && license.length > 0) {
                // API returns licenses inconsistently ordered, so fix the order.
                badgeData.text[1] = license.sort().join(',')
                badgeData.colorscheme = 'blue'
              } else {
                badgeData.text[1] = 'unknown'
              }
              sendBadge(format, badgeData)
            } else {
              throw Error('Unreachable due to regex')
            }
          } catch (e) {
            badgeData.text[1] = 'invalid'
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
