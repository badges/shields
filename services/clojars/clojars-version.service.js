'use strict'

const Joi = require('joi')
const { version: versionColor } = require('../color-formatters')
const { BaseJsonService, NotFound } = require('..')

const clojarsSchema = Joi.object({
  // optional due to non-standard 'not found' condition
  version: Joi.string(),
}).required()

module.exports = class ClojarsVersion extends BaseJsonService {
  async fetch({ clojar }) {
    const url = `https://clojars.org/${clojar}/latest-version.json`
    return this._requestJson({
      url,
      schema: clojarsSchema,
    })
  }

  static render({ clojar, version }) {
    return {
      message: `[${clojar} "${version}"]`,
      color: versionColor(version),
    }
  }

  async handle({ clojar }) {
    const json = await this.fetch({ clojar })

    if (Object.keys(json).length === 0) {
      /* Note the 'not found' response from clojars is:
          status code = 200, body = {} */
      throw new NotFound()
    }

    return this.constructor.render({ clojar, version: json.version })
  }

  // Metadata
  static get defaultBadgeData() {
    return { label: 'clojars' }
  }

  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'clojars/v',
      pattern: ':clojar+',
    }
  }

  static get examples() {
    return [
      {
        namedParams: { clojar: 'prismic' },
        staticPreview: this.render({ clojar: 'clojar', version: '1.2' }),
      },
    ]
  }
}
