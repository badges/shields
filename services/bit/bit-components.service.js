'use strict'

const Joi = require('@hapi/joi')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { downloadCount } = require('../color-formatters')
const { BaseJsonService } = require('..')

const collectionSchema = Joi.object({
  payload: Joi.object({
    totalComponents: nonNegativeInteger,
  }).required(),
}).required()

module.exports = class BitComponents extends BaseJsonService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'bit/collection/total-components',
      pattern: ':owner/:collection',
    }
  }

  static get examples() {
    return [
      {
        title: 'bit',
        namedParams: { owner: 'ramda', collection: 'ramda' },
        staticPreview: this.render({ count: 330 }),
        keywords: ['components'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'components' }
  }

  static render({ count }) {
    return { message: metric(count), color: downloadCount(count) }
  }

  async fetch({ owner, collection }) {
    const url = `https://api.bit.dev/scope/${owner}/${collection}/`
    return this._requestJson({
      url,
      schema: collectionSchema,
      errorMessages: {
        404: 'collection not found',
      },
    })
  }

  async handle({ owner, collection }) {
    const json = await this.fetch({ owner, collection })
    return this.constructor.render({ count: json.payload.totalComponents })
  }
}
