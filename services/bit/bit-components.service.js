'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('..')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')

const collectionSchema = Joi.object({
  payload: Joi.object({
    totalComponents: nonNegativeInteger,
  }).required(),
}).required()

module.exports = class bitComponents extends BaseJsonService {
  async fetch({ owner, scope }) {
    const url = `https://api.bit.dev/scope/${owner}/${scope}/`
    return this._requestJson({
      url,
      schema: collectionSchema,
      errorMessages: {
        404: 'collection not found',
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
