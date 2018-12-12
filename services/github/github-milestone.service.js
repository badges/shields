'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLogo: getLogo,
} = require('../../lib/badge-data')
const { metric } = require('../../lib/text-formatters')
const {
  documentation,
  checkErrorResponse: githubCheckErrorResponse,
} = require('./github-helpers')

module.exports = class GithubMilestone extends LegacyService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'github',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub open milestones',
        previewUrl: 'milestones/badges/shields/open',
        keywords: ['GitHub', 'milestone'],
        documentation,
      },
      {
        title: 'GitHub open milestones',
        previewUrl: 'milestones-raw/badges/shields/open',
        keywords: ['GitHub', 'milestone'],
        documentation,
      },
      {
        title: 'GitHub closed milestones',
        previewUrl: 'milestones/badges/shields/closed',
        keywords: ['GitHub', 'milestone'],
        documentation,
      },
      {
        title: 'GitHub closed milestones',
        previewUrl: 'milestones-raw/badges/shields/closed',
        keywords: ['GitHub', 'milestone'],
        documentation,
      },
      {
        title: 'GitHub total milestones',
        previewUrl: 'milestones-raw/badges/shields/all',
        keywords: ['GitHub', 'milestone'],
        documentation,
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    camp.route(
      /^\/github\/milestones(-raw)?\/([^/]+)\/([^/]+)\/(open|closed|all)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const isRaw = !!match[1]
        const user = match[2] // eg, badges
        const repo = match[3] // eg, shields
        const state = match[4] // open/closed/all
        const stateName = state === 'all' ? 'total' : state
        const format = match[5] // svg/png/gif/jpg/json

        const apiUrl = `/repos/${user}/${repo}/milestones`
        const badgeData = getBadgeData(
          isRaw ? `${stateName} milestones` : 'milestones',
          data
        )
        if (badgeData.template === 'social') {
          badgeData.logo = getLogo('github', data)
        }
        badgeData.colorscheme = 'blue'
        githubApiProvider.request(
          request,
          apiUrl,
          { state },
          (err, res, buffer) => {
            if (githubCheckErrorResponse(badgeData, err, res)) {
              sendBadge(format, badgeData)
              return
            }
            try {
              const data = JSON.parse(buffer)
              const number = data.length
              badgeData.text[1] =
                metric(number) + (!isRaw ? ` ${stateName}` : '')
              sendBadge(format, badgeData)
            } catch (e) {
              badgeData.text[1] = 'invalid'
              sendBadge(format, badgeData)
            }
          }
        )
      })
    )
  }
}
