'use strict'

const crypto = require('crypto')
const Joi = require('joi')
const { metric } = require('../text-formatters')
const { floorCount } = require('../color-formatters')
const { BaseJsonService } = require('..')

const apiSchema = Joi.object({
  total: Joi.number().required(),
}).required()

module.exports = class TreewareTrees extends BaseJsonService {
  static category = 'other'

  static route = {
    base: 'treeware/trees',
    pattern: ':owner/:packageName',
  }

  static examples = [
    {
      title: 'Treeware (Trees)',
      namedParams: { owner: 'stoplightio', packageName: 'spectral' },
      staticPreview: this.render({ count: 250 }),
    },
  ]

  static defaultBadgeData = {
    label: 'trees',
  }

  static render({ count }) {
    return { message: metric(count), color: floorCount(count, 10, 50, 100) }
  }

  async fetch({ reference }) {
    const url = `https://public.offset.earth/users/treeware/trees`
    return this._requestJson({
      url,
      schema: apiSchema,
      options: {
        qs: { ref: reference },
      },
    })
  }

  async handle({ owner, packageName }) {
    const reference = crypto
      .createHash('md5')
      .update(`${owner}/${packageName}`)
      .digest('hex')
    const { total } = await this.fetch({ reference })

    return this.constructor.render({ count: total })
  }
}
