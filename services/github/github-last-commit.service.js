'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLogo: getLogo,
} = require('../../lib/badge-data')
const { formatDate } = require('../../lib/text-formatters')
const { age: ageColor } = require('../../lib/color-formatters')
const {
  documentation,
  checkErrorResponse: githubCheckErrorResponse,
} = require('./github-helpers')

module.exports = class GithubLastCommit extends LegacyService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'github/last-commit',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub last commit',
        previewUrl: 'google/skia',
        keywords: ['GitHub', 'last', 'latest', 'commit'],
        documentation,
      },
      {
        title: 'GitHub last commit (branch)',
        previewUrl: 'google/skia/infra/config',
        keywords: ['GitHub', 'last', 'latest', 'commit'],
        documentation,
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    camp.route(
      /^\/github\/last-commit\/([^/]+)\/([^/]+)(?:\/(.+))?\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const user = match[1] // eg, mashape
        const repo = match[2] // eg, apistatus
        const branch = match[3]
        const format = match[4]
        let apiUrl = `/repos/${user}/${repo}/commits`
        if (branch) {
          apiUrl += `?sha=${branch}`
        }
        const badgeData = getBadgeData('last commit', data)
        if (badgeData.template === 'social') {
          badgeData.logo = getLogo('github', data)
          badgeData.links = [`https://github.com/${user}/${repo}`]
        }
        githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
          if (githubCheckErrorResponse(badgeData, err, res)) {
            sendBadge(format, badgeData)
            return
          }
          try {
            const parsedData = JSON.parse(buffer)
            const commitDate = parsedData[0].commit.author.date
            badgeData.text[1] = formatDate(commitDate)
            badgeData.colorscheme = ageColor(Date.parse(commitDate))
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
