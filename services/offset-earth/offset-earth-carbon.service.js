'use strict'

const Joi = require('@hapi/joi')
const { metric } = require('../text-formatters')
const { floorCount } = require('../color-formatters')
const { BaseJsonService } = require('..')

const apiSchema = Joi.object({
  total: Joi.number()
    .positive()
    .required(),
}).required()

module.exports = class OffsetEarthCarbonOffset extends BaseJsonService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'offset-earth/carbon',
      pattern: ':owner',
    }
  }

  static get examples() {
    return [
      {
        title: 'Offset Earth (Carbon Offset)',
        namedParams: { owner: 'offsetearth' },
        staticPreview: this.render({ count: 15.05 }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'carbon offset' }
  }

  static render({ count }) {
    const tonnes = metric(count)
    return { message: `${tonnes} tonnes`, color: floorCount(count, 0.5, 1, 5) }
  }

  async fetch({ owner }) {
    const url = `https://public.offset.earth/users/${owner}/carbon-offset`
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
