import Joi from 'joi'
import { pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import TrmnlBase from './trmnl-base.js'

const schema = Joi.object({
  stats: Joi.object({
    installs: nonNegativeInteger,
    forks: nonNegativeInteger,
  }).required(),
}).required()

const description =
  'Total connections for a public [TRMNL Recipe](https://trmnl.com/recipes), calculated as installs plus forks. Data is fetched through the open-source [TRMNL Badges proxy](https://github.com/hossain-khan/trmnl-badges), which provides caching and request deduplication in front of the TRMNL API.'

export default class TrmnlConnections extends TrmnlBase {
  static category = 'social'

  static route = {
    base: 'trmnl/connections',
    pattern: ':recipeId',
  }

  static openApi = {
    '/trmnl/connections/{recipeId}': {
      get: {
        summary: 'TRMNL Recipe Connections',
        description,
        parameters: pathParams({
          name: 'recipeId',
          description: 'TRMNL Recipe ID',
          example: '227153',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'connections', namedLogo: 'trmnl' }

  static render({ connections }) {
    return {
      message: metric(connections),
      color: 'blue',
    }
  }

  async handle({ recipeId }) {
    const data = await this.fetch({ recipeId, schema })
    const connections = data.stats.installs + data.stats.forks
    return this.constructor.render({ connections })
  }
}
