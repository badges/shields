import Joi from 'joi'
import { renderVersionBadge, latest } from '../version.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  // In most cases `version` will be a SemVer but the registry doesn't
  // actually enforce this.
  version: Joi.string().required(),
}).required()

const versionSchema = Joi.array()
  .items(
    Joi.object({
      number: Joi.string().required(),
    })
  )
  .min(1)
  .required()

const queryParamSchema = Joi.object({
  include_prereleases: Joi.equal(''),
}).required()

export default class GemVersion extends BaseJsonService {
  static category = 'version'
  static route = { base: 'gem/v', pattern: ':gem', queryParamSchema }
  static examples = [
    {
      title: 'Gem',
      namedParams: { gem: 'formatador' },
      staticPreview: this.render({ version: '2.1.0' }),
      keywords: ['ruby'],
    },
    {
      title: 'Gem (including prereleases)',
      namedParams: { gem: 'flame' },
      queryParams: {
        include_prereleases: null,
      },
      staticPreview: this.render({ version: '5.0.0.rc6' }),
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

  async handle({ gem }, queryParams) {
    if (queryParams && typeof queryParams.include_prereleases !== 'undefined') {
      const data = await this.fetchLatest({ gem })
      const versions = data.map(version => version.number)
      return this.constructor.render({ version: latest(versions) })
    } else {
      const { version } = await this.fetch({ gem })
      return this.constructor.render({ version })
    }
  }
}
