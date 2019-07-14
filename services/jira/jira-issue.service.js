'use strict'

const Joi = require('@hapi/joi')
const { authConfig } = require('./jira-common')
const { BaseJsonService } = require('..')

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
  static get category() {
    return 'issue-tracking'
  }

  static get route() {
    return {
      base: 'jira/issue',
      // Do not base new services on this route pattern.
      // See https://github.com/badges/shields/issues/3714
      pattern: ':protocol(http|https)/:hostAndPath(.+)/:issueKey',
    }
  }

  static get auth() {
    return authConfig
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

  static get defaultBadgeData() {
    return { color: 'lightgrey', label: 'jira' }
  }

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

  async handle({ protocol, hostAndPath, issueKey }) {
    // Atlassian Documentation: https://developer.atlassian.com/cloud/jira/platform/rest/v2/#api-api-2-issue-issueIdOrKey-get
    const json = await this._requestJson({
      schema,
      url: `${protocol}://${hostAndPath}/rest/api/2/issue/${encodeURIComponent(
        issueKey
      )}`,
      options: { auth: this.authHelper.basicAuth },
      errorMessages: { 404: 'issue not found' },
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
