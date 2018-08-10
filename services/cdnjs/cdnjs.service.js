'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('../base')
const { NotFound } = require('../errors')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')

const cdnjsSchema = Joi.object({
  version: Joi.string(),
}).required()

module.exports = class Cdnjs extends BaseJsonService {
  async handle({ library }) {
    const url = `https://api.cdnjs.com/libraries/${library}?fields=version`
    const json = await this._requestJson({
      url,
      schema: cdnjsSchema,
    })

    if (Object.keys(json).length === 0) {
      /* Note the 'not found' response from cdnjs is:
         status code = 200, body = {} */
      throw new NotFound()
    }

    return {
      message: versionText(json.version),
      color: versionColor(json.version),
    }
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
