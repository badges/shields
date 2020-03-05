'use strict'

const { metric } = require('../text-formatters')
const { floorCount } = require('../color-formatters')
const { BaseJsonService } = require('..')
const Joi = require('@hapi/joi')

const apiSchema = Joi.object({
  total: Joi.number()
    .positive()
    .required(),
}).required()

module.exports = class OffsetEarthTrees extends BaseJsonService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'offset-earth/trees',
      pattern: ':owner',
    }
  }

  static get examples() {
    return [
      {
        title: 'Offset Earth (Trees)',
        namedParams: { owner: 'offsetearth' },
        staticPreview: this.render({ count: 250 }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'trees' }
  }

  static render({ count }) {
    return { message: metric(count), color: floorCount(count, 10, 50, 100) }
  }

  async fetch({ owner }) {
    const url = `https://public.offset.earth/users/${owner}/trees`
    return this._requestJson({
      url,
      schema: apiSchema,
      errorMessages: {
        404: 'profile not found',
      },
    })
  }

  async handle({ owner }) {
    const { total } = await this.fetch({ owner })

    return this.constructor.render({ count: total })
  }
}
