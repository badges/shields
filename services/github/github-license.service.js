'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLogo: getLogo,
  setBadgeColor,
} = require('../../lib/badge-data')
const { licenseToColor } = require('../../lib/licenses')
const {
  documentation,
  checkErrorResponse: githubCheckErrorResponse,
} = require('./github-helpers')

module.exports = class GithubLicense extends LegacyService {
  static get category() {
    return 'license'
  }

  static get route() {
    return {
      base: 'github/license',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub',
        previewUrl: 'mashape/apistatus',
        keywords: ['GitHub', 'license'],
        documentation,
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    camp.route(
      /^\/github\/license\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const user = match[1] // eg, mashape
        const repo = match[2] // eg, apistatus
        const format = match[3]
        const apiUrl = `/repos/${user}/${repo}`
        const badgeData = getBadgeData('license', data)
        if (badgeData.template === 'social') {
          badgeData.logo = getLogo('github', data)
        }
        githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
          if (
            githubCheckErrorResponse(badgeData, err, res, 'repo not found', {
              403: 'access denied',
            })
          ) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const body = JSON.parse(buffer)
            const license = body.license
            if (license != null) {
              if (!license.spdx_id || license.spdx_id === 'NOASSERTION') {
                badgeData.text[1] = 'unknown'
              } else {
                badgeData.text[1] = license.spdx_id
              }
              setBadgeColor(badgeData, licenseToColor(license.spdx_id))
              sendBadge(format, badgeData)
            } else {
              badgeData.text[1] = 'missing'
              badgeData.colorscheme = 'red'
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
