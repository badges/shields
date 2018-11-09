'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const serverSecrets = require('../../lib/server-secrets')

module.exports = class JiraIssue extends LegacyService {
  static get category() {
    return 'issue-tracking'
  }

  static get route() {
    return {
      base: 'jira/issue',
    }
  }

  static get examples() {
    return [
      {
        title: 'JIRA issue',
        previewUrl: 'https/issues.apache.org/jira/KAFKA-2896',
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/jira\/issue\/(http(?:s)?)\/(.+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const protocol = match[1] // eg, https
        const host = match[2] // eg, issues.apache.org/jira
        const issueKey = match[3] // eg, KAFKA-2896
        const format = match[4]

        const options = {
          method: 'GET',
          json: true,
          uri: `${protocol}://${host}/rest/api/2/issue/${encodeURIComponent(
            issueKey
          )}`,
        }
        if (serverSecrets && serverSecrets.jira_username) {
          options.auth = {
            user: serverSecrets.jira_username,
            pass: serverSecrets.jira_password,
          }
        }

        // map JIRA color names to closest shields color schemes
        const colorMap = {
          'medium-gray': 'lightgrey',
          green: 'green',
          yellow: 'yellow',
          brown: 'orange',
          'warm-red': 'red',
          'blue-gray': 'blue',
        }

        const badgeData = getBadgeData(issueKey, data)
        request(options, (err, res, json) => {
          if (err !== null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            const jiraIssue = json
            if (jiraIssue.fields && jiraIssue.fields.status) {
              if (jiraIssue.fields.status.name) {
                badgeData.text[1] = jiraIssue.fields.status.name // e.g. "In Development"
              }
              if (jiraIssue.fields.status.statusCategory) {
                badgeData.colorscheme =
                  colorMap[jiraIssue.fields.status.statusCategory.colorName] ||
                  'lightgrey'
              }
            } else {
              badgeData.text[1] = 'invalid'
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
