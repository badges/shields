'use strict'

const Joi = require('joi')

const BaseJsonService = require('../base-json')
const { addv: versionText } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')

// Response should contain a string key 'version'
// In most cases this will be a SemVer
// but the registry doesn't actually enforce this
const versionSchema = Joi.object({
  version: Joi.string().required(),
}).required()

module.exports = class GemVersion extends BaseJsonService {
  async fetch({ repo }) {
    const url = `https://rubygems.org/api/v1/gems/${repo}.json`
    return this._requestJson({
      url,
      schema: versionSchema,
    })
  }

  static render({ version }) {
    return {
      message: versionText(version),
      color: versionColor(version),
    }
  }

  async handle({ repo }) {
    const { version } = await this.fetch({ repo })
    return this.constructor.render({ version })
  }

  // Metadata
  static get defaultBadgeData() {
    return { label: 'gem' }
  }

  static get category() {
    return 'version'
  }

  static get url() {
    return {
      base: 'gem/v',
      format: '(.+)',
      capture: ['repo'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Gem',
        exampleUrl: 'formatador',
        urlPattern: ':package',
        staticExample: this.render({ version: '2.1.0' }),
        keywords: ['ruby'],
      },
    ]
  }
}
