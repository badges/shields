'use strict'

const Joi = require('joi')
const { optionalUrl } = require('../validators')
const { BaseJsonService } = require('..')
const { authConfig } = require('./jira-common')

const queryParamSchema = Joi.object({
  baseUrl: optionalUrl.required(),
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

module.exports = class JiraIssue extends BaseJsonService {
  static category = 'issue-tracking'

  static route = {
    base: 'jira/issue',
    pattern: ':issueKey',
    queryParamSchema,
  }

  static auth = authConfig

  static examples = [
    {
      title: 'JIRA issue',
      namedParams: {
        issueKey: 'KAFKA-2896',
      },
      queryParams: {
        baseUrl: 'https://issues.apache.org/jira',
      },
      staticPreview: this.render({
        issueKey: 'KAFKA-2896',
        statusName: 'Resolved',
        statusColor: 'green',
      }),
    },
  ]

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
        errorMessages: { 404: 'issue not found' },
      })
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
