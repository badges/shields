'use strict'

const Joi = require('joi')
const { renderVersionBadge } = require('../../lib/version')
const BaseJsonService = require('../base-json')
const { NotFound } = require('../errors')

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
    return renderVersionBadge({ version })
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

  static get route() {
    return {
      base: 'cdnjs/v',
      format: '(.+)',
      capture: ['library'],
    }
  }

  static get examples() {
    return [
      {
        pattern: ':library',
        exampleUrl: 'jquery',
        staticExample: this.render({ version: '1.5.2' }),
        keywords: ['cdn', 'cdnjs'],
      },
    ]
  }
}
