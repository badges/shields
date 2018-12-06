'use strict'

const LegacyService = require('../legacy-service')
const {
  makeBadgeData: getBadgeData,
  makeLabel: getLabel,
  makeLogo: getLogo,
} = require('../../lib/badge-data')
const { documentation } = require('./github-helpers')

module.exports = class GithubCommitsSince extends LegacyService {
  static get category() {
    return 'activity'
  }

  static get route() {
    return {
      base: 'github/commits-since',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub commits',
        previewUrl: 'SubtitleEdit/subtitleedit/3.4.7',
        keywords: ['GitHub', 'commit'],
        documentation,
      },
      {
        title: 'GitHub commits (since latest release)',
        previewUrl: 'SubtitleEdit/subtitleedit/latest',
        keywords: ['GitHub', 'commit'],
        documentation,
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache, githubApiProvider }) {
    camp.route(
      /^\/github\/commits-since\/([^/]+)\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const user = match[1] // eg, SubtitleEdit
        const repo = match[2] // eg, subtitleedit
        const version = match[3] // eg, 3.4.7 or latest
        const format = match[4]
        const badgeData = getBadgeData(`commits since ${version}`, data)

        function setCommitsSinceBadge(user, repo, version) {
          const apiUrl = `/repos/${user}/${repo}/compare/${version}...master`
          if (badgeData.template === 'social') {
            badgeData.logo = getLogo('github', data)
          }
          githubApiProvider.request(request, apiUrl, {}, (err, res, buffer) => {
            if (err != null) {
              badgeData.text[1] = 'inaccessible'
              sendBadge(format, badgeData)
              return
            }

            try {
              const result = JSON.parse(buffer)
              badgeData.text[1] = result.ahead_by
              badgeData.colorscheme = 'blue'
              badgeData.text[0] = getLabel(`commits since ${version}`, data)
              sendBadge(format, badgeData)
            } catch (e) {
              badgeData.text[1] = 'invalid'
              sendBadge(format, badgeData)
            }
          })
        }

        if (version === 'latest') {
          const url = `/repos/${user}/${repo}/releases/latest`
          githubApiProvider.request(request, url, {}, (err, res, buffer) => {
            if (err != null) {
              badgeData.text[1] = 'inaccessible'
              sendBadge(format, badgeData)
              return
            }
            try {
              const data = JSON.parse(buffer)
              setCommitsSinceBadge(user, repo, data.tag_name)
            } catch (e) {
              badgeData.text[1] = 'invalid'
              sendBadge(format, badgeData)
            }
          })
        } else {
          setCommitsSinceBadge(user, repo, version)
        }
      })
    )
  }
}
