import Joi from 'joi'
import { BaseJsonService } from '../index.js'
import {
  IMPROVED_STATUS,
  NOT_FOUND_STATUS,
  REGRESSED_STATUS,
  NO_CHANGE_STATUS,
} from './constants.js'

const schema = Joi.string()
  .allow(IMPROVED_STATUS, REGRESSED_STATUS, NO_CHANGE_STATUS)
  .required()

/**
 * Criterion Badge Service
 *
 * Support and Contact:
 * - https://github.com/chmoder/api.criterion.dev
 *
 * API Documentation:
 * - https://app.swaggerhub.com/apis-docs/chmoder/Criterion.dev
 */
export default class Criterion extends BaseJsonService {
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
    let statusColor = 'lightgrey'

    if (status === IMPROVED_STATUS) {
      statusColor = 'brightgreen'
    } else if (status === NO_CHANGE_STATUS) {
      statusColor = 'green'
    } else if (statusColor === REGRESSED_STATUS) {
      statusColor = 'red'
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
