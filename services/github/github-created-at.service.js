import dayjs from 'dayjs'
import Joi from 'joi'
import { age } from '../color-formatters.js'
import { pathParams } from '../index.js'
import { formatDate } from '../text-formatters.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, httpErrorsFor } from './github-helpers.js'

const schema = Joi.object({
  created_at: Joi.date().required(),
}).required()

export default class GithubCreatedAt extends GithubAuthV3Service {
  static category = 'activity'
  static route = { base: 'github/created-at', pattern: ':user/:repo' }
  static openApi = {
    '/github/created-at/{user}/{repo}': {
      get: {
        summary: 'Github Created At',
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
    const date = dayjs(createdAt)
    return {
      message: formatDate(date),
      color: age(date),
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
