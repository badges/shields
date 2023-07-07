import gql from 'graphql-tag'
import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV4Service } from './github-auth-service.js'
import { documentation, transformErrors } from './github-helpers.js'

const discussionsSearchDocs = `
For a full list of available filters and allowed values that can be used in the <code>query</code>,
see GitHub's documentation on
[Searching discussions](https://docs.github.com/en/search-github/searching-on-github/searching-discussions).
${documentation}
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

  static examples = [
    {
      title: 'GitHub discussions custom search',
      namedParams: {},
      queryParams: {
        query: 'repo:badges/shields is:answered answered-by:chris48s',
      },
      staticPreview: {
        label: 'query',
        message: '2',
        color: 'blue',
      },
      documentation: discussionsSearchDocs,
    },
  ]

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

  static examples = [
    {
      title: 'GitHub discussions custom search in repo',
      namedParams: {
        user: 'badges',
        repo: 'shields',
      },
      queryParams: {
        query: 'is:answered answered-by:chris48s',
      },
      staticPreview: {
        label: 'query',
        message: '2',
        color: 'blue',
      },
      documentation: discussionsSearchDocs,
    },
  ]

  async handle({ user, repo }, { query }) {
    query = `repo:${user}/${repo} ${query}`
    const discussionCount = await this.fetch({ query })
    return this.constructor.render({ discussionCount })
  }
}

export { GithubDiscussionsSearch, GithubRepoDiscussionsSearch }
