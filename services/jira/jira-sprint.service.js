'use strict'

const Joi = require('@hapi/joi')
const { authConfig } = require('./jira-common')
const { BaseJsonService } = require('..')

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

module.exports = class JiraSprint extends BaseJsonService {
  static get category() {
    return 'issue-tracking'
  }

  static get route() {
    return {
      base: 'jira/sprint',
      // Do not base new services on this route pattern.
      // See https://github.com/badges/shields/issues/3714
      pattern: ':protocol(http|https)/:hostAndPath(.+)/:sprintId',
    }
  }

  static get auth() {
    return authConfig
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
        keywords: ['issues'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'jira' }
  }

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

  async handle({ protocol, hostAndPath, sprintId }) {
    // Atlassian Documentation: https://developer.atlassian.com/cloud/jira/platform/rest/v2/#api-group-Search
    // There are other sprint-specific APIs but those require authentication. The search API
    // allows us to get the needed data without being forced to authenticate.
    const json = await this._requestJson({
      url: `${protocol}://${hostAndPath}/rest/api/2/search`,
      schema,
      options: {
        qs: {
          jql: `sprint=${sprintId} AND type IN (Bug,Improvement,Story,"Technical task")`,
          fields: 'resolution',
          maxResults: 500,
        },
        auth: this.authHelper.basicAuth,
      },
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
