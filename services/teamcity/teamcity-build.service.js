'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')

// This legacy service should be rewritten to use e.g. BaseJsonService.
//
// Tips for rewriting:
// https://github.com/badges/shields/blob/master/doc/rewriting-services.md
//
// Do not base new services on this code.
function teamcityBadge(
  url,
  buildId,
  advanced,
  format,
  data,
  sendBadge,
  request
) {
  const apiUrl = `${url}/app/rest/builds/buildType:(id:${buildId})?guest=1`
  const badgeData = getBadgeData('build', data)
  request(
    apiUrl,
    { headers: { Accept: 'application/json' } },
    (err, res, buffer) => {
      if (err != null) {
        badgeData.text[1] = 'inaccessible'
        sendBadge(format, badgeData)
        return
      }
      try {
        const data = JSON.parse(buffer)
        if (advanced)
          badgeData.text[1] = (
            data.statusText ||
            data.status ||
            ''
          ).toLowerCase()
        else badgeData.text[1] = (data.status || '').toLowerCase()
        if (data.status === 'SUCCESS') {
          badgeData.colorscheme = 'brightgreen'
          badgeData.text[1] = 'passing'
        } else {
          badgeData.colorscheme = 'red'
        }
        sendBadge(format, badgeData)
      } catch (e) {
        badgeData.text[1] = 'invalid'
        sendBadge(format, badgeData)
      }
    }
  )
}

module.exports = class TeamcityBuild extends LegacyService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'teamcity',
    }
  }

  static get examples() {
    return [
      {
        title: 'TeamCity CodeBetter',
        previewUrl: 'codebetter/bt428',
      },
      {
        title: 'TeamCity (simple build status)',
        previewUrl: 'http/teamcity.jetbrains.com/s/bt345',
      },
      {
        title: 'TeamCity (full build status)',
        previewUrl: 'http/teamcity.jetbrains.com/e/bt345',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    // Old url for CodeBetter TeamCity instance.
    camp.route(
      /^\/teamcity\/codebetter\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const buildType = match[1] // eg, `bt428`.
        const format = match[2]
        teamcityBadge(
          'http://teamcity.codebetter.com',
          buildType,
          false,
          format,
          data,
          sendBadge,
          request
        )
      })
    )

    // Generic TeamCity instance
    camp.route(
      /^\/teamcity\/(http|https)\/(.*)\/(s|e)\/(.*)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const scheme = match[1]
        const serverUrl = match[2]
        const advanced = match[3] === 'e'
        const buildType = match[4] // eg, `bt428`.
        const format = match[5]
        teamcityBadge(
          `${scheme}://${serverUrl}`,
          buildType,
          advanced,
          format,
          data,
          sendBadge,
          request
        )
      })
    )
  }
}
