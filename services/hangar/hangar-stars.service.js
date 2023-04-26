import { metric } from '../text-formatters.js'
import { BaseHangarService, documentation, keywords } from './hangar-base.js'

export default class HangarStars extends BaseHangarService {
  static category = 'social'

  static route = {
    base: 'hangar/stars',
    pattern: ':author/:slug',
  }

  static examples = [
    {
      title: 'Hangar Stars',
      namedParams: {
        author: 'GeyserMC',
        slug: 'Geyser',
      },
      staticPreview: this.render({
        stars: 1000,
      }),
      documentation,
      keywords,
    },
  ]

  static defaultBadgeData = {
    label: 'stars',
    color: 'blue',
  }

  static render({ stars }) {
    return {
      message: metric(stars),
    }
  }

  async handle({ author, slug }) {
    const { stats } = await this.fetch({ author, slug })
    const { stars } = stats
    return this.constructor.render({ stars })
  }
}
