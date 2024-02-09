import gql from 'graphql-tag'
import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV4Service } from './github-auth-service.js'
import { documentation, transformErrors } from './github-helpers.js'

const discussionsSearchDocs = `
For a full list of available filters and allowed values,
see GitHub's documentation on
[Searching discussions](https://docs.github.com/en/search-github/searching-on-github/searching-discussions).
`

const discussionCountSchema = Joi.object({
  data: Joi.object({
    search: Joi.object({
      discussionCount: nonNegativeInteger,
    }).required(),
  }).required(),
}).required()

const queryParamSchema = Joi.object({
  query: Joi.string().required(),
}).required()

class BaseGithubDiscussionsSearch extends GithubAuthV4Service {
  static category = 'other'
  static defaultBadgeData = { label: 'query', color: 'informational' }

  static render({ discussionCount }) {
    return { message: metric(discussionCount) }
  }

  async fetch({ query }) {
    const data = await this._requestGraphql({
      query: gql`
        query ($query: String!) {
          search(query: $query, type: DISCUSSION) {
            discussionCount
          }
        }
      `,
      variables: { query },
      schema: discussionCountSchema,
      transformErrors,
    })
    return data.data.search.discussionCount
  }
}

class GithubDiscussionsSearch extends BaseGithubDiscussionsSearch {
  static route = {
    base: 'github',
    pattern: 'discussions-search',
    queryParamSchema,
  }

  static openApi = {
    '/github/discussions-search': {
      get: {
        summary: 'GitHub discussions custom search',
        description: documentation,
        parameters: [
          queryParam({
            name: 'query',
            description: discussionsSearchDocs,
            example: 'repo:badges/shields is:answered answered-by:chris48s',
            required: true,
          }),
        ],
      },
    },
  }

  async handle(namedParams, { query }) {
    const discussionCount = await this.fetch({ query })
    return this.constructor.render({ discussionCount })
  }
}

class GithubRepoDiscussionsSearch extends BaseGithubDiscussionsSearch {
  static route = {
    base: 'github',
    pattern: 'discussions-search/:user/:repo',
    queryParamSchema,
  }

  static openApi = {
    '/github/discussions-search/{user}/{repo}': {
      get: {
        summary: 'GitHub discussions custom search in repo',
        description: documentation,
        parameters: [
          pathParam({ name: 'user', example: 'badges' }),
          pathParam({ name: 'repo', example: 'shields' }),
          queryParam({
            name: 'query',
            description: discussionsSearchDocs,
            example: 'is:answered answered-by:chris48s',
            required: true,
          }),
        ],
      },
    },
  }

  async handle({ user, repo }, { query }) {
    query = `repo:${user}/${repo} ${query}`
    const discussionCount = await this.fetch({ query })
    return this.constructor.render({ discussionCount })
  }
}

export { GithubDiscussionsSearch, GithubRepoDiscussionsSearch }
