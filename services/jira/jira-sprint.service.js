'use strict'

const LegacyService = require('../legacy-service')
const { makeBadgeData: getBadgeData } = require('../../lib/badge-data')
const serverSecrets = require('../../lib/server-secrets')

const documentation = `
<p>
  To get the <code>Sprint ID</code>, go to your Backlog view in your project,
  right click on your sprint name and get the value of
  <code>data-sprint-id</code>.
</p>
`

module.exports = class JiraSprint extends LegacyService {
  static get category() {
    return 'issue-tracking'
  }

  static get route() {
    return {
      base: 'jira/sprint',
    }
  }

  static get examples() {
    return [
      {
        title: 'JIRA sprint completion',
        previewUrl: 'https/jira.spring.io/94',
        documentation,
      },
    ]
  }

  static registerLegacyRouteHandler({ camp, cache }) {
    camp.route(
      /^\/jira\/sprint\/(http(?:s)?)\/(.+)\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      cache((data, match, sendBadge, request) => {
        const protocol = match[1] // eg, https
        const host = match[2] // eg, jira.spring.io
        const sprintId = match[3] // eg, 94
        const format = match[4] // eg, png

        const options = {
          method: 'GET',
          json: true,
          uri: `${protocol}://${host}/rest/api/2/search?jql=sprint=${sprintId}%20AND%20type%20IN%20(Bug,Improvement,Story,"Technical%20task")&fields=resolution&maxResults=500`,
        }
        if (serverSecrets && serverSecrets.jira_username) {
          options.auth = {
            user: serverSecrets.jira_username,
            pass: serverSecrets.jira_password,
          }
        }

        const badgeData = getBadgeData('completion', data)
        request(options, (err, res, json) => {
          if (err != null) {
            badgeData.text[1] = 'inaccessible'
            sendBadge(format, badgeData)
            return
          }
          try {
            if (json && json.total >= 0) {
              const issuesDone = json.issues.filter(el => {
                if (el.fields.resolution != null) {
                  return el.fields.resolution.name !== 'Unresolved'
                }
              }).length
              badgeData.text[1] = `${Math.round(
                (issuesDone * 100) / json.total
              )}%`
              switch (issuesDone) {
                case 0:
                  badgeData.colorscheme = 'red'
                  break
                case json.total:
                  badgeData.colorscheme = 'brightgreen'
                  break
                default:
                  badgeData.colorscheme = 'orange'
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
