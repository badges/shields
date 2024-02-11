import Joi from 'joi'
import { pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, httpErrorsFor } from './github-helpers.js'

const schema = Joi.object({
  followers: nonNegativeInteger,
}).required()

export default class GithubFollowers extends GithubAuthV3Service {
  static category = 'social'
  static route = { base: 'github/followers', pattern: ':user' }
  static openApi = {
    '/github/followers/{user}': {
      get: {
        summary: 'GitHub followers',
        description: documentation,
        parameters: pathParams({ name: 'user', example: 'espadrine' }),
      },
    },
  }

  static defaultBadgeData = { label: 'followers', namedLogo: 'github' }

  static render({ followers }) {
    return {
      message: metric(followers),
      style: 'social',
      color: 'blue',
    }
  }

  async handle({ user }) {
    const { followers } = await this._requestJson({
      url: `/users/${user}`,
      schema,
      httpErrors: httpErrorsFor('user not found'),
    })
    return this.constructor.render({ followers })
  }
}
