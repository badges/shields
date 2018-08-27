'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { checkErrorResponse } = require('../../lib/error-helper')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')

module.exports = class Homebrew extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/homebrew\/v\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const pkg = match[1] // eg. cake
        const format = match[2]
        const apiUrl = 'https://formulae.brew.sh/api/formula/' + pkg + '.json'

        const badgeData = getBadgeData('homebrew', data)
        request(
          apiUrl,
          { headers: { Accept: 'application/json' } },
          (err, res, buffer) => {
            if (checkErrorResponse(badgeData, err, res)) {
              sendBadge(format, badgeData)
              return
            }
            try {
              const data = JSON.parse(buffer)
              const version = data.versions.stable

              badgeData.text[1] = versionText(version)
              badgeData.colorscheme = versionColor(version)

              sendBadge(format, badgeData)
            } catch (e) {
              badgeData.text[1] = 'invalid'
              sendBadge(format, badgeData)
            }
          }
        )
      })
    )
  }
}
