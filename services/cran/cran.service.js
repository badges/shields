'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLabel: getLabel,
} = require('../../lib/badge-data')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')

class CranLicense extends LegacyService {
  static get category() {
    return 'license'
  }

  static get route() {
    return {
      base: 'cran/l',
    }
  }

  static get examples() {
    return [
      {
        title: 'CRAN/METACRAN',
        previewUrl: 'devtools',
        keywords: ['R'],
      },
    ]
  }

  static registerLegacyRouteHandler() {}
}

class CranVersion extends LegacyService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'cran/v',
    }
  }

  static get examples() {
    return [
      {
        title: 'CRAN/METACRAN',
        previewUrl: 'devtools',
        keywords: ['R'],
      },
    ]
  }

  static registerLegacyRouteHandler() {}
}

class Cran extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/cran\/([vl])\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((queryParams, match, sendBadge, request) => {
        const info = match[1] // either `v` or `l`
        const pkg = match[2] // eg, devtools
        const format = match[3]
        const url = `http://crandb.r-pkg.org/${pkg}`
        const badgeData = getBadgeData('cran', queryParams)
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
            const data = JSON.parse(buffer)

            if (info === 'v') {
              const version = data.Version
              badgeData.text[1] = versionText(version)
              badgeData.colorscheme = versionColor(version)
              sendBadge(format, badgeData)
            } else if (info === 'l') {
              badgeData.text[0] = getLabel('license', queryParams)
              const license = data.License
              if (license) {
                badgeData.text[1] = license
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

module.exports = {
  CranLicense,
  CranVersion,
  Cran,
}
