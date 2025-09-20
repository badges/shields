import Joi from 'joi'
import { queryParams, redirector } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation } from './github-helpers.js'

const schema = Joi.object({ total_count: nonNegativeInteger }).required()

const queryParamSchema = Joi.object({
  query: Joi.string().required(),
}).required()

const codeSearchDocs = `
For a full list of available filters and allowed values,
see GitHub's documentation on
[Searching code](https://docs.github.com/en/search-github/github-code-search/understanding-github-code-search-syntax)`

class GitHubCodeSearch extends GithubAuthV3Service {
  static category = 'analysis'

  static route = {
    base: 'github',
    pattern: 'search',
    queryParamSchema,
  }

  static openApi = {
    '/github/search': {
      get: {
        summary: 'GitHub code search count',
        description: documentation,
        parameters: queryParams({
          name: 'query',
          description: codeSearchDocs,
          example: 'goto language:javascript NOT is:fork NOT is:archived',
          required: true,
        }),
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

  async handle(_routeParams, { query }) {
    const { total_count: totalCount } = await this._requestJson({
      url: '/search/code',
      options: {
        searchParams: {
          q: query,
        },
      },
      schema,
      httpErrors: {
        401: 'auth required for search api',
      },
    })

    return this.constructor.render({ query, totalCount })
  }
}

const GitHubCodeSearchRedirect = redirector({
  category: 'analysis',
  route: {
    base: 'github/search',
    pattern: ':user/:repo/:query+',
  },
  transformPath: () => '/github/search',
  transformQueryParams: ({ query, user, repo }) => ({
    query: `${query} repo:${user}/${repo}`,
  }),
  dateAdded: new Date('2024-11-29'),
})

export { GitHubCodeSearch, GitHubCodeSearchRedirect }
