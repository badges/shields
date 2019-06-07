'use strict'

const Joi = require('@hapi/joi')
const { renderVersionBadge } = require('../version')
const { BaseJsonService, NotFound } = require('..')

const cdnjsSchema = Joi.object({
  // optional due to non-standard 'not found' condition
  version: Joi.string(),
}).required()

module.exports = class Cdnjs extends BaseJsonService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'cdnjs/v',
      pattern: ':library',
    }
  }

  static get examples() {
    return [
      {
        namedParams: { library: 'jquery' },
        staticPreview: this.render({ version: '1.5.2' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'cdnjs' }
  }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async fetch({ library }) {
    const url = `https://api.cdnjs.com/libraries/${library}?fields=version`
    return this._requestJson({
      url,
      schema: cdnjsSchema,
    })
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
}
