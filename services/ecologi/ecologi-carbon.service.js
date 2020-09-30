'use strict'

const Joi = require('joi')
const { metric } = require('../text-formatters')
const { floorCount } = require('../color-formatters')
const { BaseJsonService } = require('..')

const apiSchema = Joi.object({
  total: Joi.number().positive().required(),
}).required()

module.exports = class EcologiCarbonOffset extends BaseJsonService {
  static category = 'other'
  static route = { base: 'ecologi/carbon', pattern: ':username' }
  static examples = [
    {
      title: 'Ecologi (Carbon Offset)',
      namedParams: { username: 'ecologi' },
      staticPreview: this.render({ count: 15.05 }),
    },
  ]

  static defaultBadgeData = { label: 'carbon offset' }

  static render({ count }) {
    const tonnes = metric(count)
    return { message: `${tonnes} tonnes`, color: floorCount(count, 0.5, 1, 5) }
  }

  async fetch({ username }) {
    const url = `https://public.ecologi.com/users/${username}/carbon-offset`
    return this._requestJson({
      url,
      schema: apiSchema,
      errorMessages: {
        404: 'username not found',
      },
    })
  }

  async handle({ username }) {
    const { total } = await this.fetch({ username })

    return this.constructor.render({ count: total })
  }
}
