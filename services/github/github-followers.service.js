import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, errorMessagesFor } from './github-helpers.js'

const schema = Joi.object({
  followers: nonNegativeInteger,
}).required()

export default class GithubFollowers extends GithubAuthV3Service {
  static category = 'social'
  static route = { base: 'github/followers', pattern: ':user' }
  static examples = [
    {
      title: 'GitHub followers',
      namedParams: { user: 'espadrine' },
      staticPreview: Object.assign(this.render({ followers: 150 }), {
        label: 'Follow',
        style: 'social',
      }),
      queryParams: { label: 'Follow' },
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'followers', namedLogo: 'github' }

  static render({ followers }) {
    return {
      message: metric(followers),
      color: 'blue',
    }
  }

  async handle({ user }) {
    const { followers } = await this._requestJson({
      url: `/users/${user}`,
      schema,
      errorMessages: errorMessagesFor('user not found'),
    })
    return this.constructor.render({ followers })
  }
}
