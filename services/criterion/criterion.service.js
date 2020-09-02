'use strict'

const Joi = require('@hapi/joi')
const { BaseJsonService } = require('..')
const { IMPROVED_STATUS, NOT_FOUND_STATUS } = require('./constants')

const schema = Joi.string().required()

module.exports = class Criterion extends BaseJsonService {
  static get category() {
    return 'analysis'
  }

  static get route() {
    return {
      base: 'criterion',
      pattern: ':user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'Criterion',
        namedParams: {
          user: 'chmoder',
          repo: 'data_vault',
        },
        staticPreview: this.render({
          isImproved: true,
          status: IMPROVED_STATUS,
        }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'criterion' }
  }

  static render({ isImproved, status }) {
    if (isImproved) {
      return {
        message: `${status}`,
        color: 'brightgreen',
      }
    } else {
      return {
        message: `${status}`,
        color: 'yellow',
      }
    }
  }

  async handle({ user, repo }) {
    const status = await this._requestJson({
      url: `https://api.criterion.dev/v1/${user}/${repo}/status`,
      errorMessages: { 404: NOT_FOUND_STATUS },
      schema,
    })

    const isImproved = status === IMPROVED_STATUS
    return this.constructor.render({ isImproved, status })
  }
}
