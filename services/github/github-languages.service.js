'use strict'

const prettyBytes = require('pretty-bytes')
const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLogo: getLogo,
  makeLabel: getLabel,
} = require('../../lib/badge-data')
const {
  checkErrorResponse: githubCheckErrorResponse,
} = require('./github-helpers')

module.exports = class GithubLanguages extends LegacyService {
  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    camp.route(
      /^\/github\/languages\/(top|count|code-size)\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const type = match[1]
        const user = match[2]
        const repo = match[3]
        const format = match[4]
        const apiUrl = `/repos/${user}/${repo}/languages`
        const badgeData = getBadgeData('languages', data)
        if (badgeData.template === 'social') {
          badgeData.logo = getLogo('github', data)
        }
        githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
          if (githubCheckErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const parsedData = JSON.parse(buffer)
            let sumBytes = 0
            switch (type) {
              case 'top': {
                let topLanguage = 'language'
                let maxBytes = 0
                for (const language of Object.keys(parsedData)) {
                  const bytes = parseInt(parsedData[language])
                  if (bytes >= maxBytes) {
                    maxBytes = bytes
                    topLanguage = language
                  }
                  sumBytes += bytes
                }
                badgeData.text[0] = getLabel(topLanguage, data)
                if (sumBytes === 0) {
                  // eg, empty repo, only .md files, etc.
                  badgeData.text[1] = 'none'
                  badgeData.colorscheme = 'blue'
                } else {
                  badgeData.text[1] =
                    ((maxBytes / sumBytes) * 100).toFixed(1) + '%' // eg, 9.1%
                }
                break
              }
              case 'count':
                badgeData.text[0] = getLabel('languages', data)
                badgeData.text[1] = Object.keys(parsedData).length
                badgeData.colorscheme = 'blue'
                break
              case 'code-size':
                for (const language of Object.keys(parsedData)) {
                  sumBytes += parseInt(parsedData[language])
                }
                badgeData.text[0] = getLabel('code size', data)
                badgeData.text[1] = prettyBytes(sumBytes)
                badgeData.colorscheme = 'blue'
                break
              default:
                throw Error('Unreachable due to regex')
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
