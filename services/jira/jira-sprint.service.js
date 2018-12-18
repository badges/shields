'use strict'

const Joi = require('joi')
const JiraBase = require('./jira-base')

const schema = Joi.object({
  total: Joi.number(),
  issues: Joi.array()
    .items(
      Joi.object({
        fields: Joi.object({
          resolution: Joi.object({
            name: Joi.string(),
          }).allow(null),
        }).required(),
      })
    )
    .required(),
}).required()

const documentation = `
<p>
  To get the <code>Sprint ID</code>, go to your Backlog view in your project,
  right click on your sprint name and get the value of
  <code>data-sprint-id</code>.
</p>
`

module.exports = class JiraSprint extends JiraBase {
  static render({ numCompletedIssues, numTotalIssues }) {
    const percentComplete = numTotalIssues
      ? (numCompletedIssues / numTotalIssues) * 100
      : 0
    let color = 'orange'
    if (numCompletedIssues === 0) {
      color = 'red'
    } else if (numCompletedIssues === numTotalIssues) {
      color = 'brightgreen'
    }
    return {
      label: 'completion',
      message: `${percentComplete.toFixed(0)}%`,
      color,
    }
  }

  static get defaultBadgeData() {
    return { label: 'jira' }
  }

  static get route() {
    return {
      base: 'jira/sprint',
      pattern: ':protocol(http|https)/:hostAndPath(.+)/:sprintId',
    }
  }

  static get examples() {
    return [
      {
        title: 'JIRA sprint completion',
        pattern: ':protocol/:hostAndPath/:sprintId',
        namedParams: {
          protocol: 'https',
          hostAndPath: 'jira.spring.io',
          sprintId: '94',
        },
        staticPreview: this.render({
          numCompletedIssues: 27,
          numTotalIssues: 28,
        }),
        documentation,
        keywords: ['jira', 'sprint', 'issues'],
      },
    ]
  }

  async handle({ protocol, hostAndPath, sprintId }) {
    // Atlassian Documentation: https://developer.atlassian.com/cloud/jira/platform/rest/v2/#api-group-Search
    // There are other sprint-specific APIs but those require authentication. The search API
    // allows us to get the needed data without being forced to authenticate.
    const url = `${protocol}://${hostAndPath}/rest/api/2/search`
    const qs = {
      jql: `sprint=${sprintId} AND type IN (Bug,Improvement,Story,"Technical task")`,
      fields: 'resolution',
      maxResults: 500,
    }
    const json = await this.fetch({
      url,
      schema,
      qs,
      errorMessages: {
        400: 'sprint not found',
        404: 'sprint not found',
      },
    })
    const numTotalIssues = json.total
    const numCompletedIssues = json.issues.filter(issue => {
      if (issue.fields.resolution != null) {
        return issue.fields.resolution.name !== 'Unresolved'
      }
    }).length

    return this.constructor.render({ numTotalIssues, numCompletedIssues })
  }
}
