import { pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { BaseHangarService, description } from './hangar-base.js'

export default class HangarWatchers extends BaseHangarService {
  static category = 'social'

  static route = {
    base: 'hangar/watchers',
    pattern: ':slug',
  }

  static openApi = {
    '/hangar/watchers/{slug}': {
      get: {
        summary: 'Hangar Watchers',
        description,
        parameters: pathParams({
          name: 'slug',
          example: 'Essentials',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'watchers',
    color: 'blue',
  }

  static render({ watchers }) {
    return {
      message: metric(watchers),
    }
  }

  async handle({ slug }) {
    const {
      stats: { watchers },
    } = await this.fetch({ slug })
    return this.constructor.render({ watchers })
  }
}
