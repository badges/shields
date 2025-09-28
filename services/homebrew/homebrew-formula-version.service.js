import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService, pathParams } from '../index.js'

const schema = Joi.object({
  versions: Joi.object({
    stable: Joi.string().required(),
  }).required(),
}).required()

export default class HomebrewVersion extends BaseJsonService {
  static category = 'version'

  static route = { base: 'homebrew/v', pattern: ':formula' }

  static openApi = {
    '/homebrew/v/{formula}': {
      get: {
        summary: 'Homebrew Formula Version',
        parameters: pathParams({
          name: 'formula',
          example: 'cake',
        }),
      },
    },
  }

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
