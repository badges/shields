import { metric } from '../text-formatters.js'
import { BaseHangarService, documentation } from './hangar-base.js'

export default class HangarFollowers extends BaseHangarService {
  static category = 'social'

  static route = {
    base: 'hangar/watchers',
    pattern: ':author/:slug',
  }

  // For anyone wondering, watchers are the same as followers.
  // I just used watchers because it's the term used in the API and the Hangar UI.

  static examples = [
    {
      title: 'Hangar Watchers',
      namedParams: { author: 'GeyserMC', slug: 'Geyser' },
      staticPreview: Object.assign(this.render({ watchers: 176 }), {
        label: 'Watchers',
        style: 'social',
      }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'watchers' }

  static render({ watchers }) {
    return {
      message: metric(watchers),
      color: 'blue',
    }
  }

  async handle({ author, slug }) {
    const project = `${author}/${slug}`
    const { watchers } = (await this.fetchProject({ project })).stats
    return this.constructor.render({ watchers })
  }
}
