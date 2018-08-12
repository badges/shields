'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const { NotFound } = require('../errors')
const { version: versionColor } = require('../../lib/color-formatters')

const clojarsSchema = Joi.object({
  // optional due to non-standard 'not found' condition
  version: Joi.string(),
}).required()

module.exports = class Clojars extends BaseJsonService {
  async handle({ clojar }) {
    const url = `https://clojars.org/${clojar}/latest-version.json`
    const json = await this._requestJson({
      url,
      schema: clojarsSchema,
    })

    if (Object.keys(json).length === 0) {
      /* Note the 'not found' response from clojars is:
          status code = 200, body = {} */
      throw new NotFound()
    }

    return {
      message: '[' + clojar + ' "' + json.version + '"]',
      color: versionColor(json.version),
    }
  }

  // Metadata
  static get defaultBadgeData() {
    return { label: 'clojars' }
  }

  static get category() {
    return 'version'
  }

  static get url() {
    return {
      base: 'clojars/v',
      format: '(.+)',
      capture: ['clojar'],
    }
  }

  static get examples() {
    return [{ previewUrl: 'prismic' }]
  }
}
