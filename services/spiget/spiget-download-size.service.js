'use strict'

const BaseJsonService = require('../base-json')

const Joi = require('joi')

const schema = Joi.object({
  file: Joi.object({
    size: Joi.number().required(),
    sizeUnit: Joi.string().required(),
  }).required(),
}).required()

//const schema = Joi.any()

module.exports = class SpigetDownloadSize extends BaseJsonService {
  static get route() {
    return {
      base: 'spiget/download-size',
      pattern: ':resourceid',
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'size',
      color: 'brightgreen',
    }
  }

  async handle({ resourceid }) {
    const { file } = await this.fetch({ resourceid })
    return this.constructor.render({ size: file.size, unit: file.sizeUnit })
  }

  async fetch({ resourceid }) {
    const url = `https://api.spiget.org/v2/resources/${resourceid}`

    return this._requestJson({
      schema,
      url,
    })
  }

  static render({ size, unit }) {
    return {
      message: `${size} ${unit}`,
    }
  }

  static get category() {
    return 'size'
  }
  static get examples() {
    return [
      {
        title: 'Spiget Download Size',
        namedParams: {
          resourceid: '9089',
        },
        staticPreview: this.render({ size: 2.5, unit: 'MB' }),
      },
    ]
  }
}
