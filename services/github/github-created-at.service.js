import Joi from 'joi'
import { pathParams } from '../index.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, httpErrorsFor } from './github-helpers.js'

const schema = Joi.object({
  created_at: Joi.string().required(),
}).required()

export default class GithubCreatedAt extends GithubAuthV3Service {
  static category = 'activity'
  static route = { base: 'github/created-at', pattern: ':user/:repo' }
  static openApi = {
    '/github/created-at/{user}/{repo}': {
      get: {
        summary: 'GitHub Created At',
        description: documentation,
        parameters: pathParams(
          {
            name: 'user',
            example: 'mashape',
          },
          {
            name: 'repo',
            example: 'apistatus',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'created at' }

  static render({ createdAt }) {
    return {
      message: createdAt,
    }
  }

  async handle({ user, repo }) {
    const { created_at: createdAt } = await this._requestJson({
      schema,
      url: `/repos/${user}/${repo}`,
      httpErrors: httpErrorsFor('repo not found'),
    })

    return this.constructor.render({ createdAt })
  }
}
