import Joi from 'joi'
import { url } from '../validators.js'
import { BaseJsonService, pathParam, queryParam } from '../index.js'
import { authConfig } from './jira-common.js'

const queryParamSchema = Joi.object({
  baseUrl: url,
}).required()

const schema = Joi.object({
  fields: Joi.object({
    status: Joi.object({
      name: Joi.string().required(),
      statusCategory: Joi.object({
        colorName: Joi.string().required(),
      }),
    }).required(),
  }).required(),
}).required()

export default class JiraIssue extends BaseJsonService {
  static category = 'issue-tracking'

  static route = {
    base: 'jira/issue',
    pattern: ':issueKey',
    queryParamSchema,
  }

  static auth = authConfig

  static openApi = {
    '/jira/issue/{issueKey}': {
      get: {
        summary: 'JIRA issue',
        parameters: [
          pathParam({
            name: 'issueKey',
            example: 'KAFKA-2896',
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

  static defaultBadgeData = { color: 'lightgrey', label: 'jira' }

  static render({ issueKey, statusName, statusColor }) {
    let color = 'lightgrey'
    if (statusColor) {
      // map JIRA status color names to closest shields color schemes
      const colorMap = {
        'medium-gray': 'lightgrey',
        green: 'green',
        yellow: 'yellow',
        brown: 'orange',
        'warm-red': 'red',
        'blue-gray': 'blue',
      }
      color = colorMap[statusColor]
    }
    return {
      label: issueKey,
      message: statusName,
      color,
    }
  }

  async handle({ issueKey }, { baseUrl }) {
    // Atlassian Documentation: https://developer.atlassian.com/cloud/jira/platform/rest/v2/#api-api-2-issue-issueIdOrKey-get
    const json = await this._requestJson(
      this.authHelper.withBasicAuth({
        schema,
        url: `${baseUrl}/rest/api/2/issue/${encodeURIComponent(issueKey)}`,
        httpErrors: { 404: 'issue not found' },
      }),
    )

    const issueStatus = json.fields.status
    const statusName = issueStatus.name
    let statusColor
    if (issueStatus.statusCategory) {
      statusColor = issueStatus.statusCategory.colorName
    }
    return this.constructor.render({
      issueKey,
      statusName,
      statusColor,
    })
  }
}
