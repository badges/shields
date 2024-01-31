import { pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { BaseHangarService, description } from './hangar-base.js'

export default class HangarStars extends BaseHangarService {
  static category = 'social'

  static route = {
    base: 'hangar/stars',
    pattern: ':slug',
  }

  static openApi = {
    '/hangar/stars/{slug}': {
      get: {
        summary: 'Hangar Stars',
        description,
        parameters: pathParams({
          name: 'slug',
          example: 'Essentials',
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

  async handle({ slug }) {
    const {
      stats: { stars },
    } = await this.fetch({ slug })
    return this.constructor.render({ stars })
  }
}
