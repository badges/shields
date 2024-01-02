import { pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { BaseOreService, description } from './ore-base.js'

export default class OreStars extends BaseOreService {
  static category = 'rating'

  static route = {
    base: 'ore/stars',
    pattern: ':pluginId',
  }

  static openApi = {
    '/ore/stars/{pluginId}': {
      get: {
        summary: 'Ore Stars',
        description,
        parameters: pathParams({
          name: 'pluginId',
          example: 'nucleus',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'stars',
    color: 'blue',
  }

  static render({ stars }) {
    return {
      message: metric(stars),
    }
  }

  async handle({ pluginId }) {
    const { stats } = await this.fetch({ pluginId })
    const { stars } = stats
    return this.constructor.render({ stars })
  }
}
