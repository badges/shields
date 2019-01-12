'use strict'

const BaseJsonService = require('../base-json')

const Joi = require('joi')

const latestVersionSchema = Joi.object({
  downloads: Joi.number().required(),
  name: Joi.string().required(),
}).required()

//const schema = Joi.any()

module.exports = class SpigetLatestVersion extends BaseJsonService {
  static get route() {
    return {
      base: 'spiget/version',
      pattern: ':resourceid',
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'version',
      color: 'blue',
    }
  }

  async handle({ resourceid }) {
    const { name } = await this.fetch({ resourceid })
    return this.constructor.render({ version: name })
  }

  async fetch({ resourceid }) {
    const url = `https://api.spiget.org/v2/resources/${resourceid}/versions/latest`

    return this._requestJson({
      schema: latestVersionSchema,
      url,
      errorMessages: {
        404: 'null',
      },
    })
  }

  static render({ version }) {
    return {
      message: `v${version}`,
    }
  }

  static get category() {
    return 'version'
  }
  static get examples() {
    return [
      {
        title: 'Spiget Version',
        namedParams: {
          resourceid: '9089',
        },
        staticPreview: this.render({ version: 2.1 }),
      },
    ]
  }
}
