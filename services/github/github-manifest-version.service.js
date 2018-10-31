'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLabel: getLabel,
} = require('../../lib/badge-data')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')
const {
  checkErrorResponse: githubCheckErrorResponse,
} = require('./github-helpers')

// For GitHub package and manifest version.
module.exports = class GithubManifestVersion extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/github\/(package|manifest)-json\/([^/]+)\/([^/]+)\/([^/]+)\/?([^/]+)?\.(svg|png|gif|jpg|json)$/,
      cache((queryData, match, sendBadge, request) => {
        const type = match[1]
        let info = match[2]
        const user = match[3]
        const repo = match[4]
        const branch = match[5] || 'master'
        const format = match[6]
        const apiUrl = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${type}.json`
        const badgeData = getBadgeData(type, queryData)
        request(apiUrl, (err, res, buffer) => {
          if (githubCheckErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const jsonData = JSON.parse(buffer)
            switch (info) {
              case 'v':
              case 'version': {
                const version = jsonData.version
                badgeData.text[1] = versionText(version)
                badgeData.colorscheme = versionColor(version)
                break
              }
              case 'n':
                info = 'name'
              // falls through
              default: {
                const value =
                  typeof jsonData[info] !== 'undefined' &&
                  typeof jsonData[info] !== 'object'
                    ? jsonData[info]
                    : Array.isArray(jsonData[info])
                      ? jsonData[info].join(', ')
                      : 'invalid data'
                badgeData.text[0] = getLabel(`${type} ${info}`, queryData)
                badgeData.text[1] = value
                badgeData.colorscheme =
                  value !== 'invalid data' ? 'blue' : 'lightgrey'
                break
              }
            }
            sendBadge(format, badgeData)
          } catch (e) {
            badgeData.text[1] = 'invalid data'
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
