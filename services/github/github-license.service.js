'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { makeLogo: getLogo } = require('../../lib/logos')
const { licenseToColor } = require('../../lib/licenses')
const {
  documentation,
  checkErrorResponse: githubCheckErrorResponse,
} = require('./github-helpers')

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
module.exports = class GithubLicense extends LegacyService {
  static get category() {
    return 'license'
  }

  static get route() {
    return {
      base: 'github/license',
      pattern: ':user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub',
        namedParams: { user: 'mashape', repo: 'apistatus' },
        staticPreview: {
          label: 'license',
          message: 'MIT',
          color: 'green',
        },
        keywords: ['license'],
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
              badgeData.colorB = licenseToColor(license.spdx_id)
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
