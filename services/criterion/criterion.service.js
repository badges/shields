'use strict'

const Joi = require('@hapi/joi')
const { BaseJsonService } = require('..')
const { IMPROVED_STATUS, NOT_FOUND_STATUS, REGRESSED_STATUS } = require('./constants')

const schema = Joi.string().required()

/**
 * Criterion Badge Service
 *
 * Support and Contact:
 * - https://github.com/chmoder/api.criterion.dev
 *
 * API Documentation:
 * - https://app.swaggerhub.com/apis-docs/chmoder/Criterion.dev
 */
module.exports = class Criterion extends BaseJsonService {
  static category = 'analysis'
  static route = { base: 'criterion', pattern: ':user/:repo' }

  static examples = [
    {
      title: 'Criterion',
      namedParams: {
        user: 'chmoder',
        repo: 'data_vault',
      },
      staticPreview: this.render({ status: IMPROVED_STATUS }),
    },
  ]

  static defaultBadgeData = { label: 'criterion' }

  static render({ status }) {
    let statusColor = 'brightgreen'

    if (status !== IMPROVED_STATUS) {
      statusColor = 'yellow'
    }

    return {
      message: `${status}`,
      color: statusColor,
    }
  }

  async handle({ user, repo }) {
    const status = await this._requestJson({
      url: `https://api.criterion.dev/v1/${user}/${repo}/status`,
      errorMessages: { 404: NOT_FOUND_STATUS },
      schema,
    })

    return this.constructor.render({ status })
  }
}
