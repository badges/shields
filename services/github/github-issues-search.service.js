import gql from 'graphql-tag'
import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV4Service } from './github-auth-service.js'
import { documentation, transformErrors } from './github-helpers.js'

const issuesSearchDocs = `
For a full list of available filters and allowed values,
see GitHub's documentation on
[Searching issues and pull requests](https://docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests)
`

const issueCountSchema = Joi.object({
  data: Joi.object({
    search: Joi.object({
      issueCount: nonNegativeInteger,
    }).required(),
  }).required(),
}).required()

const queryParamSchema = Joi.object({
  query: Joi.string().required(),
}).required()

class BaseGithubIssuesSearch extends GithubAuthV4Service {
  static category = 'issue-tracking'
  static defaultBadgeData = { label: 'query', color: 'informational' }

  static render({ issueCount }) {
    return { message: metric(issueCount) }
  }

  async fetch({ query }) {
    const data = await this._requestGraphql({
      query: gql`
        query ($query: String!) {
          search(query: $query, type: ISSUE) {
            issueCount
          }
        }
      `,
      variables: { query },
      schema: issueCountSchema,
      transformErrors,
    })
    return data.data.search.issueCount
  }
}

class GithubIssuesSearch extends BaseGithubIssuesSearch {
  static route = {
    base: 'github',
    pattern: 'issues-search',
    queryParamSchema,
  }

  static openApi = {
    '/github/issues-search': {
      get: {
        summary: 'GitHub issue custom search',
        description: documentation,
        parameters: [
          queryParam({
            name: 'query',
            description: issuesSearchDocs,
            example:
              'repo:badges/shields is:closed label:bug author:app/sentry-io',
            required: true,
          }),
        ],
      },
    },
  }

  async handle(namedParams, { query }) {
    const issueCount = await this.fetch({ query })
    return this.constructor.render({ issueCount })
  }
}

class GithubRepoIssuesSearch extends BaseGithubIssuesSearch {
  static route = {
    base: 'github',
    pattern: 'issues-search/:user/:repo',
    queryParamSchema,
  }

  static openApi = {
    '/github/issues-search/{user}/{repo}': {
      get: {
        summary: 'GitHub issue custom search in repo',
        description: documentation,
        parameters: [
          pathParam({ name: 'user', example: 'badges' }),
          pathParam({ name: 'repo', example: 'shields' }),
          queryParam({
            name: 'query',
            description: issuesSearchDocs,
            example: 'is:closed label:bug author:app/sentry-io',
            required: true,
          }),
        ],
      },
    },
  }

  async handle({ user, repo }, { query }) {
    query = `repo:${user}/${repo} ${query}`
    const issueCount = await this.fetch({ query })
    return this.constructor.render({ issueCount })
  }
}

export { GithubIssuesSearch, GithubRepoIssuesSearch }
