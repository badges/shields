import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { BaseJsonService } from '../index.js'
import { nonNegativeInteger } from '../validators.js'

const schema = Joi.object({
  followers: nonNegativeInteger,
}).required()

export default class ModrinthFollowers extends BaseJsonService {
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
    },
  ]

  static defaultBadgeData = { label: 'followers' }

  static render({ followers }) {
    return {
      message: metric(followers),
      color: 'blue',
    }
  }

  async fetch({ projectId }) {
    return this._requestJson({
      schema,
      url: `https://api.modrinth.com/v2/project/${projectId}`,
    })
  }

  async handle({ projectId }) {
    const { followers } = await this.fetch({ projectId })
    return this.constructor.render({ followers })
  }
}
