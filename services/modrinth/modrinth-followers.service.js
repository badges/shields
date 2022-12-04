import { metric } from '../text-formatters.js'
import { BaseModrinthService, documentation } from './modrinth-base.js'

export default class ModrinthFollowers extends BaseModrinthService {
  static category = 'social'

  static route = {
    base: 'modrinth/followers',
    pattern: ':projectId',
  }

  static examples = [
    {
      title: 'Modrinth Followers',
      namedParams: { projectId: 'AANobbMI' },
      staticPreview: Object.assign(this.render({ followers: 176 }), {
        label: 'Followers',
        style: 'social',
      }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'followers' }

  static render({ followers }) {
    return {
      message: metric(followers),
      color: 'blue',
    }
  }

  async handle({ projectId }) {
    const { followers } = await this.fetchProject({ projectId })
    return this.constructor.render({ followers })
  }
}
