import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  versions: Joi.object({
    stable: Joi.string().required(),
  }).required(),
}).required()

export default class HomebrewVersion extends BaseJsonService {
  static category = 'version'

  static route = { base: 'homebrew/v', pattern: ':formula' }

  static examples = [
    {
      title: 'homebrew version',
      namedParams: { formula: 'cake' },
      staticPreview: renderVersionBadge({ version: 'v0.32.0' }),
    },
  ]

  static defaultBadgeData = { label: 'homebrew' }

  async fetch({ formula }) {
    return this._requestJson({
      schema,
      url: `https://formulae.brew.sh/api/formula/${formula}.json`,
    })
  }

  async handle({ formula }) {
    const data = await this.fetch({ formula })
    return renderVersionBadge({ version: data.versions.stable })
  }
}
