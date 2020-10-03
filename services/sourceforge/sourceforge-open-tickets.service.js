'use strict'

const Joi = require('joi')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  count: nonNegativeInteger.required(),
}).required()

module.exports = class SourceforgeOpenTickets extends BaseJsonService {
  static category = 'other'

  static route = {
    base: 'sourceforge/open-tickets',
    pattern: ':project/:type(bugs|feature-requests)',
  }

  static examples = [
    {
      title: 'Sourceforge Open Tickets',
      namedParams: {
        type: 'bugs',
        project: 'sevenzip',
      },
      staticPreview: this.render({ count: 1338 }),
    },
  ]

  static defaultBadgeData = {
    label: 'open tickets',
    color: 'blue',
  }

  static render({ count }) {
    return {
      message: metric(count),
    }
  }

  async fetch({ type, project }) {
    const url = `https://sourceforge.net/rest/p/${project}/${type}/search?limit=1&q=status%3Aopen`

    return this._requestJson({
      schema,
      url,
      errorMessages: {
        404: 'project not found',
      },
    })
  }

  async handle({ type, project }) {
    const { count } = await this.fetch({ type, project })
    return this.constructor.render({ count })
  }
}
