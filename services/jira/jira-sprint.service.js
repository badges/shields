'use strict'

const Joi = require('joi')
const BaseJiraService = require('./jira-base')

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

module.exports = class JiraSprint extends BaseJiraService {
  static render({ percentComplete, color }) {
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
      pattern: ':protocol(https?)/:host/:path?/:sprintId',
    }
  }

  static get examples() {
    return [
      {
        title: 'JIRA sprint completion',
        pattern: ':protocol/:host/:sprintId',
        namedParams: {
          protocol: 'https',
          host: 'jira.spring.io',
          sprintId: '94',
        },
        staticPreview: this.render({
          percentComplete: 96,
          color: 'orange',
        }),
        documentation,
        keywords: ['jira', 'sprint', 'issues'],
      },
    ]
  }

  async handle({ protocol, host, path, sprintId }) {
    let url = `${protocol}://${host}`
    if (path) {
      url += `/${path}`
    }
    // Atlassian Documentation: https://developer.atlassian.com/cloud/jira/platform/rest/v2/#api-group-Search
    // There are other sprint-specific APIs but those require authentication. The search API
    // allows us to get the needed data without being forced to authenticate.
    url += '/rest/api/2/search'
    const options = {
      qs: {
        jql: `sprint=${sprintId} AND type IN (Bug,Improvement,Story,"Technical task")`,
        fields: 'resolution',
        maxResults: 500,
      },
    }
    const json = await this.fetch({
      url,
      schema,
      options,
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

    const percentComplete = numTotalIssues
      ? (numCompletedIssues / numTotalIssues) * 100
      : 0
    let color = 'orange'
    if (numCompletedIssues === 0) {
      color = 'red'
    } else if (numCompletedIssues === numTotalIssues) {
      color = 'brightgreen'
    }
    return this.constructor.render({ percentComplete, color })
  }
}
