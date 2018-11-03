'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')

module.exports = class ElmPackage extends LegacyService {
  static get category() {
    return 'version'
  }

  static get url() {
    return {
      base: 'elm-package/v',
    }
  }

  static get examples() {
    return [
      {
        title: 'Elm package',
        previewUrl: 'elm/core',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/elm-package\/v\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const urlPrefix = 'https://package.elm-lang.org/packages'
        const [, user, repo, format] = match
        const apiUrl = `${urlPrefix}/${user}/${repo}/latest/elm.json`
        const badgeData = getBadgeData('elm package', data)
        request(apiUrl, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            const data = JSON.parse(buffer)
            if (data && typeof data.version === 'string') {
              badgeData.text[1] = versionText(data.version)
              badgeData.colorscheme = versionColor(data.version)
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
