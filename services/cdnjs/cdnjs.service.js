'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const { NotFound } = require('../errors')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')

const cdnjsSchema = Joi.object({
  // optional due to non-standard 'not found' condition
  version: Joi.string(),
}).required()

module.exports = class Cdnjs extends BaseJsonService {
  async fetch({ library }) {
    const url = `https://api.cdnjs.com/libraries/${library}?fields=version`
    return this._requestJson({
      url,
      schema: cdnjsSchema,
    })
  }

  static render({ version }) {
    return {
      message: versionText(version),
      color: versionColor(version),
    }
  }

  async handle({ library }) {
    const json = await this.fetch({ library })

    if (Object.keys(json).length === 0) {
      /* Note the 'not found' response from cdnjs is:
         status code = 200, body = {} */
      throw new NotFound()
    }

    return this.constructor.render({ version: json.version })
  }

  // Metadata
  static get defaultBadgeData() {
    return { label: 'cdnjs' }
  }

  static get category() {
    return 'version'
  }

  static get url() {
    return {
      base: 'cdnjs/v',
      format: '(.+)',
      capture: ['library'],
    }
  }

  static get examples() {
    return [
      {
        previewUrl: 'jquery',
        keywords: ['cdn', 'cdnjs'],
      },
    ]
  }
}
