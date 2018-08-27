'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { checkErrorResponse } = require('../../lib/error-helper')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')

module.exports = class CocoapodsVersionPlatformLicense extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/cocoapods\/(v|p|l)\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const type = match[1]
        const spec = match[2] // eg, AFNetworking
        const format = match[3]
        const apiUrl =
          'https://trunk.cocoapods.org/api/v1/pods/' + spec + '/specs/latest'
        const typeToLabel = { v: 'pod', p: 'platform', l: 'license' }
        const badgeData = getBadgeData(typeToLabel[type], data)
        badgeData.colorscheme = null
        request(apiUrl, (err, res, buffer) => {
          if (checkErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const parsedData = JSON.parse(buffer)
            const version = parsedData.version
            let license
            if (typeof parsedData.license === 'string') {
              license = parsedData.license
            } else {
              license = parsedData.license.type
            }

            const platforms = Object.keys(
              parsedData.platforms || {
                ios: '5.0',
                osx: '10.7',
              }
            ).join(' | ')
            if (type === 'v') {
              badgeData.text[1] = versionText(version)
              badgeData.colorscheme = versionColor(version)
            } else if (type === 'p') {
              badgeData.text[1] = platforms
              badgeData.colorB = '#989898'
            } else if (type === 'l') {
              badgeData.text[1] = license
              badgeData.colorB = '#373737'
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
