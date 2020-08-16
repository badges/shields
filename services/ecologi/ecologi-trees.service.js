'use strict'

const Joi = require('@hapi/joi')
const { metric } = require('../text-formatters')
const { floorCount } = require('../color-formatters')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService } = require('..')

const apiSchema = Joi.object({
  total: nonNegativeInteger,
}).required()

module.exports = class EcologiTrees extends BaseJsonService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'ecologi/trees',
      pattern: ':username',
    }
  }

  static get examples() {
    return [
      {
        title: 'Ecologi (Trees)',
        namedParams: { username: 'ecologi' },
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

  async fetch({ username }) {
    const url = `https://public.ecologi.com/users/${username}/trees`
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
