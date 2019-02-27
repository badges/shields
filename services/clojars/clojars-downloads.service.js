'use strict'

const Joi = require('joi')
const { metric } = require('../text-formatters')
const { downloadCount: downloadsColor } = require('../color-formatters')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService } = require('..')

const clojarsSchema = Joi.object({
  downloads: nonNegativeInteger,
}).required()

module.exports = class ClojarsDownloads extends BaseJsonService {
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
      pattern: ':clojar+',
    }
  }

  static get examples() {
    return [
      {
        namedParams: { clojar: 'prismic' },
        staticPreview: this.render({ downloads: 117 }),
      },
    ]
  }
}
