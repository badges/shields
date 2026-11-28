import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { optionalUrl, nonNegativeInteger } from '../validators.js'
import { metric } from '../text-formatters.js'
import GiteaBase from './gitea-base.js'
import { description, httpErrorsFor } from './gitea-helper.js'

const schema = Joi.object({
  followers_count: nonNegativeInteger,
}).required()

const queryParamSchema = Joi.object({
  gitea_url: optionalUrl,
}).required()

export default class GiteaFollowers extends GiteaBase {
  static category = 'social'

  static route = {
    base: 'gitea/followers',
    pattern: ':user',
    queryParamSchema,
  }

  static openApi = {
    '/gitea/followers/{user}': {
      get: {
        summary: 'Gitea Followers',
        description,
        parameters: [
          pathParam({
            name: 'user',
            example: 'gitea',
          }),
          queryParam({
            name: 'gitea_url',
            example: 'https://gitea.com',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'followers', namedLogo: 'gitea' }

  static render({ baseUrl, followers, user }) {
    return {
      message: metric(followers),
      style: 'social',
      color: 'blue',
      link: [`${baseUrl}/${user}?tab=followers`],
    }
  }

  async fetch({ user, baseUrl }) {
    // https://gitea.com/api/swagger#/user/userGet
    return super.fetch({
      schema,
      url: `${baseUrl}/api/v1/users/${user}`,
      httpErrors: httpErrorsFor(),
    })
  }

  async handle({ user }, { gitea_url: baseUrl = 'https://gitea.com' }) {
    const { followers_count: followers } = await this.fetch({
      user,
      baseUrl,
    })
    return this.constructor.render({ baseUrl, followers, user })
  }
}
