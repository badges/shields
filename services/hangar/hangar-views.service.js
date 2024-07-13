import { pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { BaseHangarService, description } from './hangar-base.js'

export default class HangarViews extends BaseHangarService {
  static category = 'other'

  static route = {
    base: 'hangar/views',
    pattern: ':slug',
  }

  static openApi = {
    '/hangar/views/{slug}': {
      get: {
        summary: 'Hangar Views',
        description,
        parameters: pathParams({
          name: 'slug',
          example: 'Essentials',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'views',
    color: 'blue',
  }

  static render({ views }) {
    return {
      message: metric(views),
    }
  }

  async handle({ slug }) {
    const {
      stats: { views },
    } = await this.fetch({ slug })
    return this.constructor.render({ views })
  }
}
