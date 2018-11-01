'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { metric } = require('../../lib/text-formatters')

module.exports = class BitbucketPullRequest extends LegacyService {
  static get category() {
    return 'issue-tracking'
  }

  static get url() {
    return {
      base: 'bitbucket',
    }
  }

  static get examples() {
    return [
      {
        title: 'Bitbucket open pull requests',
        previewUrl: 'pr/osrf/gazebo',
      },
      {
        title: 'Bitbucket open pull requests',
        previewUrl: 'pr-raw/osrf/gazebo',
        keywords: ['Bitbucket'],
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/bitbucket\/pr(-raw)?\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const isRaw = !!match[1]
        const user = match[2] // eg, atlassian
        const repo = match[3] // eg, python-bitbucket
        const format = match[4]
        const apiUrl =
          'https://bitbucket.org/api/2.0/repositories/' +
          encodeURI(user) +
          '/' +
          encodeURI(repo) +
          '/pullrequests/?limit=0&state=OPEN'

        const badgeData = getBadgeData('pull requests', data)
        request(apiUrl, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            if (res.statusCode !== 200) {
              throw Error('Failed to count pull requests.')
            }
            const data = JSON.parse(buffer)
            const pullrequests = data.size
            badgeData.text[1] = metric(pullrequests) + (isRaw ? '' : ' open')
            badgeData.colorscheme = pullrequests > 0 ? 'yellow' : 'brightgreen'
            sendBadge(format, badgeData)
          } catch (e) {
            if (res.statusCode === 404) {
              badgeData.text[1] = 'not found'
            } else {
              badgeData.text[1] = 'invalid'
            }
            sendBadge(format, badgeData)
          }
        })
      })
    )
  }
}
