'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const { metric } = require('../../lib/text-formatters')

module.exports = class BitbucketIssues extends LegacyService {
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
        title: 'Bitbucket issues',
        previewUrl: 'issues/atlassian/python-bitbucket',
      },
      {
        title: 'Bitbucket issues',
        previewUrl: 'issues-raw/atlassian/python-bitbucket',
        keywords: ['Bitbucket'],
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/bitbucket\/issues(-raw)?\/([^/]+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const isRaw = !!match[1]
        const user = match[2] // eg, atlassian
        const repo = match[3] // eg, python-bitbucket
        const format = match[4]
        const apiUrl =
          'https://bitbucket.org/api/1.0/repositories/' +
          user +
          '/' +
          repo +
          '/issues/?limit=0&status=new&status=open'

        const badgeData = getBadgeData('issues', data)
        request(apiUrl, (err, res, buffer) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            if (res.statusCode !== 200) {
              throw Error('Failed to count issues.')
            }
            const data = JSON.parse(buffer)
            const issues = data.count
            badgeData.text[1] = metric(issues) + (isRaw ? '' : ' open')
            badgeData.colorscheme = issues ? 'yellow' : 'brightgreen'
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
