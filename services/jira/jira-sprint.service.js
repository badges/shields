import Joi from 'joi'
import { url } from '../validators.js'
import { BaseJsonService, pathParam, queryParam } from '../index.js'
import { authConfig } from './jira-common.js'

const queryParamSchema = Joi.object({
  baseUrl: url,
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
      }),
    )
    .required(),
}).required()

const description = `
To get the \`Sprint ID\`, go to your Backlog view in your project,
right click on your sprint name and get the value of
\`data-sprint-id\`.
`

export default class JiraSprint extends BaseJsonService {
  static category = 'issue-tracking'

  static route = {
    base: 'jira/sprint',
    pattern: ':sprintId',
    queryParamSchema,
  }

  static auth = authConfig

  static openApi = {
    '/jira/sprint/{sprintId}': {
      get: {
        summary: 'JIRA sprint completion',
        description,
        parameters: [
          pathParam({
            name: 'sprintId',
            example: '94',
          }),
          queryParam({
            name: 'baseUrl',
            example: 'https://issues.apache.org/jira',
            required: true,
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'jira' }

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
          searchParams: {
            jql: `sprint=${sprintId} AND type IN (Bug,Improvement,Story,"Technical task")`,
            fields: 'resolution',
            maxResults: 500,
          },
        },
        httpErrors: {
          400: 'sprint not found',
          404: 'sprint not found',
        },
      }),
    )

    const numTotalIssues = json.total
    const numCompletedIssues = json.issues.filter(issue => {
      if (issue.fields.resolution != null) {
        return issue.fields.resolution.name !== 'Unresolved'
      }
      return false
    }).length

    return this.constructor.render({ numTotalIssues, numCompletedIssues })
  }
}
