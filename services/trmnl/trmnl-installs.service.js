import Joi from 'joi'
import { pathParams } from '../index.js'
import { renderDownloadsBadge } from '../downloads.js'
import { nonNegativeInteger } from '../validators.js'
import TrmnlBase from './trmnl-base.js'

const schema = Joi.object({
  stats: Joi.object({
    installs: nonNegativeInteger,
  }).required(),
}).required()

const description =
  'Number of installs for a public [TRMNL Recipe](https://trmnl.com/recipes). Data is fetched through the open-source [TRMNL Badges proxy](https://github.com/hossain-khan/trmnl-badges), which provides caching and request deduplication in front of the TRMNL API.'

export default class TrmnlInstalls extends TrmnlBase {
  static category = 'downloads'

  static route = {
    base: 'trmnl/dt',
    pattern: ':recipeId',
  }

  static openApi = {
    '/trmnl/dt/{recipeId}': {
      get: {
        summary: 'TRMNL Recipe Installs',
        description,
        parameters: pathParams({
          name: 'recipeId',
          description: 'TRMNL Recipe ID',
          example: '227153',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'installs' }

  static render({ installs }) {
    return renderDownloadsBadge({ downloads: installs })
  }

  async handle({ recipeId }) {
    const data = await this.fetch({ recipeId, schema })
    return this.constructor.render({ installs: data.stats.installs })
  }
}
