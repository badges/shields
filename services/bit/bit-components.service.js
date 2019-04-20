'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('..')
const { metric } = require('../text-formatters')

const ownerSchema = Joi.object({
  payload: Joi.object({
    totalComponents: Joi.number(),
  }),
}).required()

module.exports = class bitComponents extends BaseJsonService {
  async fetch({ owner, scope }) {
    const url = `https://api.bit.dev/scope/${owner}/${scope}/`
    return this._requestJson({
      url,
      schema: ownerSchema,
      errorMessages: {
        404: 'not found',
      },
    })
  }

  static render({ count }) {
    return { message: metric(count), color: '#73398D' }
  }

  async handle({ owner, scope }) {
    const json = await this.fetch({ owner, scope })
    return this.constructor.render({ count: json.payload.totalComponents })
  }

  // Metadata
  static get defaultBadgeData() {
    return { label: 'components' }
  }

  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'bit/components',
      pattern: ':owner/:scope',
    }
  }
  static get examples() {
    return [
      {
        title: 'bit',
        namedParams: { owner: 'ramda', scope: 'ramda' },
        staticPreview: this.render({ count: 330 }),
        keywords: ['components'],
      },
    ]
  }
}
