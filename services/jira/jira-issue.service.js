'use strict'

const Joi = require('joi')
const BaseJiraService = require('./jira-base')

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

module.exports = class JiraIssue extends BaseJiraService {
  static render({ issue, statusName, color }) {
    return {
      label: issue,
      message: statusName,
      color,
    }
  }

  static get defaultBadgeData() {
    return { color: 'lightgrey', label: 'jira' }
  }

  static get route() {
    return {
      base: 'jira/issue',
      pattern: ':protocol(https?)/:host/:path?/:issueKey',
    }
  }

  static get examples() {
    return [
      {
        title: 'JIRA issue',
        pattern: ':protocol/:host/:issueKey',
        namedParams: {
          protocol: 'https',
          host: 'issues.apache.org/jira',
          issueKey: 'KAFKA-2896',
        },
        staticPreview: this.render({
          issue: 'KAFKA-2896',
          statusName: 'Resolved',
          color: 'green',
        }),
        keywords: ['jira', 'issue'],
      },
    ]
  }

  async handle({ protocol, host, path, issueKey }) {
    let url = `${protocol}://${host}`
    if (path) {
      url += `/${path}`
    }

    // Atlassian Documentation: https://developer.atlassian.com/cloud/jira/platform/rest/v2/#api-api-2-issue-issueIdOrKey-get
    url += `/rest/api/2/issue/${encodeURIComponent(issueKey)}`

    const json = await this.fetch({
      url,
      schema,
      options: {},
      errorMessages: {
        404: 'issue not found',
      },
    })
    const issueStatus = json.fields.status
    const statusName = issueStatus.name
    let color = 'lightgrey'
    if (issueStatus.statusCategory) {
      // map JIRA color names to closest shields color schemes
      const colorMap = {
        'medium-gray': 'lightgrey',
        green: 'green',
        yellow: 'yellow',
        brown: 'orange',
        'warm-red': 'red',
        'blue-gray': 'blue',
      }
      color = colorMap[issueStatus.statusCategory.colorName]
    }

    return this.constructor.render({ issue: issueKey, statusName, color })
  }
}
