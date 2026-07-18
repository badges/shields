import Joi from 'joi'
import { pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import TrmnlBase from './trmnl-base.js'

const schema = Joi.object({
  stats: Joi.object({
    forks: nonNegativeInteger,
  }).required(),
}).required()

const description =
  'Number of forks for a public [TRMNL Recipe](https://trmnl.com/recipes). Data is fetched through the open-source [TRMNL Badges proxy](https://github.com/hossain-khan/trmnl-badges), which provides caching and request deduplication in front of the TRMNL API.'

export default class TrmnlForks extends TrmnlBase {
  static category = 'social'

  static route = {
    base: 'trmnl/forks',
    pattern: ':recipeId',
  }

  static openApi = {
    '/trmnl/forks/{recipeId}': {
      get: {
        summary: 'TRMNL Recipe Forks',
        description,
        parameters: pathParams({
          name: 'recipeId',
          description: 'TRMNL Recipe ID',
          example: '227153',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'forks', namedLogo: 'trmnl' }

  static render({ recipeId, forks }) {
    return {
      message: metric(forks),
      style: 'social',
      color: 'blue',
      link: [
        `https://trmnl.com/recipes/${recipeId}`,
        `https://trmnl.com/recipes/${recipeId}`,
      ],
    }
  }

  async handle({ recipeId }) {
    const data = await this.fetch({ recipeId, schema })
    return this.constructor.render({ recipeId, forks: data.stats.forks })
  }
}
