'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLabel: getLabel,
} = require('../../lib/badge-data')
const { checkErrorResponse } = require('../../lib/error-helper')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')

class DubVersion extends LegacyService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'dub/v',
    }
  }

  static get examples() {
    return [
      {
        title: 'DUB',
        previewUrl: 'vibe-d',
        keywords: ['dub'],
      },
    ]
  }

  static registerLegacyRouteHandler() {}
}

class DubLicense extends LegacyService {
  static get category() {
    return 'license'
  }

  static get route() {
    return {
      base: 'dub/l',
    }
  }

  static get examples() {
    return [
      {
        title: 'DUB',
        previewUrl: 'vibe-d',
        keywords: ['dub'],
      },
    ]
  }

  static registerLegacyRouteHandler() {}
}

class DubLicenseVersion extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/dub\/(v|l)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const info = match[1] // (v - version, l - license)
        const pkg = match[2] // package name, e.g. vibe-d
        const format = match[3]
        let apiUrl = `https://code.dlang.org/api/packages/${pkg}`
        if (info === 'v') {
          apiUrl += '/latest'
        } else if (info === 'l') {
          apiUrl += '/latest/info'
        }
        const badgeData = getBadgeData('dub', data)
        request(apiUrl, (err, res, buffer) => {
          if (checkErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const parsedData = JSON.parse(buffer)
            if (info === 'v') {
              badgeData.text[1] = versionText(parsedData)
              badgeData.colorscheme = versionColor(parsedData)
              sendBadge(format, badgeData)
            } else if (info === 'l') {
              const license = parsedData.info.license
              badgeData.text[0] = getLabel('license', data)
              if (license == null) {
                badgeData.text[1] = 'Unknown'
              } else {
                badgeData.text[1] = license
                badgeData.colorscheme = 'blue'
              }
              sendBadge(format, badgeData)
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

module.exports = {
  DubVersion,
  DubLicense,
  DubLicenseVersion,
}
