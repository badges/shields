'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')

module.exports = class Cpan extends LegacyService {
  static get url() {
    return { base: 'cpan' }
  }
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/cpan\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const info = match[1] // either `v` or `l`
        const pkg = match[2] // eg, Config-Augeas
        const format = match[3]
        const badgeData = getBadgeData('cpan', data)
        const url = `https://fastapi.metacpan.org/v1/release/${pkg}`
        request(url, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)

            if (info === 'v') {
              const version = data.version
              badgeData.text[1] = versionText(version)
              badgeData.colorscheme = versionColor(version)
            } else if (info === 'l') {
              const license = data.license[0]
              badgeData.text[1] = license
              badgeData.text[0] = 'license'
              badgeData.colorscheme = 'blue'
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
