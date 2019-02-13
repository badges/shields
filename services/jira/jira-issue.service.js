'use strict'

const Joi = require('joi')
const JiraBase = require('./jira-base')

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

module.exports = class JiraIssue extends JiraBase {
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

  static get defaultBadgeData() {
    return { color: 'lightgrey', label: 'jira' }
  }

  static get route() {
    return {
      base: 'jira/issue',
      pattern: ':protocol(http|https)/:hostAndPath(.+)/:issueKey',
    }
  }

  static get examples() {
    return [
      {
        title: 'JIRA issue',
        pattern: ':protocol/:hostAndPath/:issueKey',
        namedParams: {
          protocol: 'https',
          hostAndPath: 'issues.apache.org/jira',
          issueKey: 'KAFKA-2896',
        },
        staticPreview: this.render({
          issueKey: 'KAFKA-2896',
          statusName: 'Resolved',
          statusColor: 'green',
        }),
      },
    ]
  }

  async handle({ protocol, hostAndPath, issueKey }) {
    // Atlassian Documentation: https://developer.atlassian.com/cloud/jira/platform/rest/v2/#api-api-2-issue-issueIdOrKey-get
    const url = `${protocol}://${hostAndPath}/rest/api/2/issue/${encodeURIComponent(
      issueKey
    )}`
    const json = await this.fetch({
      url,
      schema,
      errorMessages: {
        404: 'issue not found',
      },
    })
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
