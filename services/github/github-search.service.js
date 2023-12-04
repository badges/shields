import Joi from 'joi'
import { pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation } from './github-helpers.js'

const schema = Joi.object({ total_count: nonNegativeInteger }).required()

export default class GithubSearch extends GithubAuthV3Service {
  static category = 'analysis'

  static route = {
    base: 'github/search',
    pattern: ':user/:repo/:query+',
  }

  static openApi = {
    '/github/search/{user}/{repo}/{query}': {
      get: {
        summary: 'GitHub search hit counter',
        description: documentation,
        parameters: pathParams(
          {
            name: 'user',
            example: 'torvalds',
          },
          {
            name: 'repo',
            example: 'linux',
          },
          {
            name: 'query',
            example: 'goto',
          },
        ),
      },
    },
  }

  static defaultBadgeData = {
    label: 'counter',
  }

  static render({ query, totalCount }) {
    return {
      label: `${query} counter`,
      message: metric(totalCount),
      color: 'blue',
    }
  }

  async handle({ user, repo, query }) {
    const { total_count: totalCount } = await this._requestJson({
      url: '/search/code',
      options: {
        searchParams: {
          q: `${query} repo:${user}/${repo}`,
        },
      },
      schema,
      httpErrors: {
        401: 'auth required for search api',
        404: 'repo not found',
        422: 'repo not found',
      },
    })
    return this.constructor.render({ query, totalCount })
  }
}
