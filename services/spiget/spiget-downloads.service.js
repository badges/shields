'use strict'

const BaseJsonService = require('../base-json')
const { metric } = require('../../lib/text-formatters')

const Joi = require('joi')
const schema = Joi.object({
  downloads: Joi.number().required(),
}).required()

module.exports = class SpigetDownloads extends BaseJsonService {
  static get route() {
    return {
      base: 'spiget/downloads',
      pattern: ':resourceid',
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'downloads',
      color: 'brightgreen',
    }
  }

  async handle({ resourceid }) {
    const { downloads } = await this.fetch({ resourceid })
    return this.constructor.render({ downloads })
  }

  async fetch({ resourceid }) {
    const url = `https://api.spiget.org/v2/resources/${resourceid}`

    return this._requestJson({
      schema,
      url,
    })
  }

  static render({ downloads }) {
    return {
      message: metric(downloads),
    }
  }

  static get category() {
    return 'other'
  }
  static get examples() {
    return [
      {
        title: 'Spiget Downloads',
        namedParams: {
          resourceid: '9089',
        },
        staticPreview: this.render({ downloads: 560891 }),
      },
    ]
  }
}
