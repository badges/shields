'use strict'

const Joi = require('@hapi/joi')
const { optionalUrl } = require('../validators')
const { BaseJsonService } = require('..')
const { authConfig } = require('./jira-common')

const queryParamSchema = Joi.object({
  baseUrl: optionalUrl.required(),
}).required()

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
      pattern: ':sprintId',
      queryParamSchema,
    }
  }

  static get auth() {
    return authConfig
  }

  static get examples() {
    return [
      {
        title: 'JIRA sprint completion',
        namedParams: {
          sprintId: '94',
        },
        queryParams: {
          baseUrl: 'https://jira.spring.io',
        },
        staticPreview: this.render({
          numCompletedIssues: 27,
          numTotalIssues: 28,
        }),
        documentation,
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

  async handle({ sprintId }, { baseUrl }) {
    // Atlassian Documentation: https://developer.atlassian.com/cloud/jira/platform/rest/v2/#api-group-Search
    // There are other sprint-specific APIs but those require authentication. The search API
    // allows us to get the needed data without being forced to authenticate.
    const json = await this._requestJson(
      this.authHelper.withBasicAuth({
        url: `${baseUrl}/rest/api/2/search`,
        schema,
        options: {
          qs: {
            jql: `sprint=${sprintId} AND type IN (Bug,Improvement,Story,"Technical task")`,
            fields: 'resolution',
            maxResults: 500,
          },
        },
        errorMessages: {
          400: 'sprint not found',
          404: 'sprint not found',
        },
      })
    )

    const numTotalIssues = json.total
    const numCompletedIssues = json.issues.filter(issue => {
      if (issue.fields.resolution != null) {
        return issue.fields.resolution.name !== 'Unresolved'
      }
    }).length

    return this.constructor.render({ numTotalIssues, numCompletedIssues })
  }
}
