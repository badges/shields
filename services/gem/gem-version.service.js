'use strict'

const Joi = require('joi')
const { renderVersionBadge, latest } = require('../version')
const { BaseJsonService, NotFound } = require('..')
const { nonNegativeInteger } = require('../validators')

const schema = Joi.object({
  // In most cases `version` will be a SemVer but the registry doesn't
  // actually enforce this.
  version: Joi.string().required(),
}).required()

const versionSchema = Joi.array()
  .items(
    Joi.object({
      prerelease: Joi.boolean().required(),
      number: Joi.string().required(),
      downloads_count: nonNegativeInteger,
    })
  )
  .min(1)
  .required()

const defaultDistribution = 'stable'

module.exports = class GemVersion extends BaseJsonService {
  static category = 'version'
  static route = { base: 'gem/v', pattern: ':gem/:distribution?' }
  static examples = [
    {
      title: 'Gem',
      namedParams: { gem: 'formatador' },
      staticPreview: this.render({ version: '2.1.0' }),
      keywords: ['ruby'],
    },
  ]

  static defaultBadgeData = { label: 'gem' }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async fetch({ gem }) {
    return this._requestJson({
      schema,
      url: `https://rubygems.org/api/v1/gems/${gem}.json`,
    })
  }

  async fetchLatest({ gem }) {
    return this._requestJson({
      schema: versionSchema,
      url: `https://rubygems.org/api/v1/versions/${gem}.json`,
    })
  }

  async handle({ gem, distribution = defaultDistribution }) {
    if (distribution === defaultDistribution) {
      const { version } = await this.fetch({ gem })
      return this.constructor.render({ version })
    } else {
      const data = await this.fetchLatest({ gem })
      if (!Array.isArray(data) || data.length === 0) {
        throw new NotFound()
      }
      const versions = data.map(version => version.number)
      return this.constructor.render({ version: latest(versions) })
    }
  }
}
