'use strict'

const Joi = require('joi')
const { renderVersionBadge } = require('../version')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  // In most cases `version` will be a SemVer but the registry doesn't
  // actually enforce this.
  version: Joi.string().required(),
}).required()

module.exports = class GemVersion extends BaseJsonService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'gem/v',
      pattern: ':gem',
    }
  }

  static get examples() {
    return [
      {
        title: 'Gem',
        namedParams: { gem: 'formatador' },
        staticPreview: this.render({ version: '2.1.0' }),
        keywords: ['ruby'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'gem' }
  }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async fetch({ gem }) {
    return this._requestJson({
      schema,
      url: `https://rubygems.org/api/v1/gems/${gem}.json`,
    })
  }

  async handle({ gem }) {
    const { version } = await this.fetch({ gem })
    return this.constructor.render({ version })
  }
}
