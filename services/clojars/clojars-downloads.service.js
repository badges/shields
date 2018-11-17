'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const { metric } = require('../../lib/text-formatters')
const { nonNegativeInteger } = require('../validators')
const { downloadCount: downloadsColor } = require('../../lib/color-formatters')

const clojarsSchema = Joi.object({
  downloads: nonNegativeInteger,
}).required()

module.exports = class Clojars extends BaseJsonService {
  async fetch({ clojar }) {
    const url = `https://clojars.org/api/artifacts/${clojar}`
    return this._requestJson({
      url,
      schema: clojarsSchema,
    })
  }

  static render({ downloads }) {
    return {
      label: 'downloads',
      message: metric(downloads),
      color: downloadsColor(downloads),
    }
  }

  async handle({ clojar }) {
    const json = await this.fetch({ clojar })
    return this.constructor.render({ downloads: json.downloads })
  }

  // Metadata
  static get defaultBadgeData() {
    return { label: 'downloads' }
  }

  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'clojars/dt',
      format: '(.+)',
      capture: ['clojar'],
    }
  }

  static get examples() {
    return [
      {
        exampleUrl: 'prismic',
        pattern: ':package',
        staticExample: this.render({ downloads: 117 }),
      },
    ]
  }
}
