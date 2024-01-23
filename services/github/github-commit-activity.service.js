import gql from 'graphql-tag'
import Joi from 'joi'
import parseLinkHeader from 'parse-link-header'
import { InvalidResponse, pathParam, queryParam } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV4Service } from './github-auth-service.js'
import {
  transformErrors,
  documentation,
  httpErrorsFor,
} from './github-helpers.js'

const schema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      object: Joi.object({
        history: Joi.object({
          totalCount: nonNegativeInteger,
        }).required(),
      }).allow(null),
    }).required(),
  }).required(),
}).required()

const queryParamSchema = Joi.object({
  authorFilter: Joi.string(),
})

export default class GitHubCommitActivity extends GithubAuthV4Service {
  static category = 'activity'
  static route = {
    base: 'github/commit-activity',
    pattern: ':interval(t|y|m|4w|w)/:user/:repo/:branch*',
    queryParamSchema,
  }

  static openApi = {
    '/github/commit-activity/{interval}/{user}/{repo}': {
      get: {
        summary: 'GitHub commit activity',
        description: documentation,
        parameters: [
          pathParam({
            name: 'interval',
            example: 'm',
            description: 'Commits in the last Week, Month, Year, or Total',
            schema: {
              type: 'string',
              // Override the enum to omit the deprecated interval "4w".
              enum: ['w', 'm', 'y', 't'],
            },
          }),
          pathParam({ name: 'user', example: 'badges' }),
          pathParam({ name: 'repo', example: 'squint' }),
          queryParam({ name: 'authorFilter', example: 'calebcartwright' }),
        ],
      },
    },
    '/github/commit-activity/{interval}/{user}/{repo}/{branch}': {
      get: {
        summary: 'GitHub commit activity (branch)',
        description: documentation,
        parameters: [
          pathParam({
            name: 'interval',
            example: 'm',
            description: 'Commits in the last Week, Month, Year, or Total',
            schema: {
              type: 'string',
              // Override the enum to omit the deprecated interval "4w".
              enum: ['w', 'm', 'y', 't'],
            },
          }),
          pathParam({ name: 'user', example: 'badges' }),
          pathParam({ name: 'repo', example: 'squint' }),
          pathParam({ name: 'branch', example: 'main' }),
          queryParam({ name: 'authorFilter', example: 'calebcartwright' }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'commit activity', color: 'blue' }

  static render({ interval, commitCount, authorFilter }) {
    // If total commits selected change label from commit activity to commits
    const label = interval === 't' ? 'commits' : 'commit activity'
    const authorFilterLabel = authorFilter ? ` by ${authorFilter}` : ''

    const intervalLabel = {
      t: '',
      y: '/year',
      m: '/month',
      '4w': '/four weeks',
      w: '/week',
    }[interval]

    return {
      label: `${label}${authorFilterLabel}`,
      message: `${metric(commitCount)}${intervalLabel}`,
    }
  }

  async fetch({ interval, user, repo, branch = 'HEAD' }) {
    const since = this.constructor.getIntervalQueryStartDate({ interval })
    return this._requestGraphql({
      query: gql`
        query (
          $user: String!
          $repo: String!
          $branch: String!
          $since: GitTimestamp
        ) {
          repository(owner: $user, name: $repo) {
            object(expression: $branch) {
              ... on Commit {
                history(since: $since) {
                  totalCount
                }
              }
            }
          }
        }
      `,
      variables: {
        user,
        repo,
        branch,
        since,
      },
      schema,
      transformErrors,
    })
  }

  async fetchAuthorFilter({
    interval,
    user,
    repo,
    branch = 'HEAD',
    authorFilter,
  }) {
    const since =
      this.constructor.getIntervalQueryStartDate({ interval }) || undefined

    return this._request({
      url: `/repos/${user}/${repo}/commits`,
      options: {
        searchParams: {
          sha: branch,
          author: authorFilter,
          per_page: '1',
          since,
        },
      },
      httpErrors: httpErrorsFor('repo or branch not found'),
    })
  }

  static transform({ data }) {
    const {
      repository: { object: repo },
    } = data

    if (!repo) {
      throw new InvalidResponse({ prettyMessage: 'invalid branch' })
    }

    return repo.history.totalCount
  }

  static transformAuthorFilter({ res }) {
    const parsed = parseLinkHeader(res.headers.link)

    if (!parsed) {
      return 0
    }

    return parsed.last.page
  }

  static getIntervalQueryStartDate({ interval }) {
    const now = new Date()

    if (interval === 't') {
      return null
    } else if (interval === 'y') {
      now.setUTCFullYear(now.getUTCFullYear() - 1)
    } else if (interval === 'm' || interval === '4w') {
      now.setUTCDate(now.getUTCDate() - 30)
    } else {
      now.setUTCDate(now.getUTCDate() - 7)
    }

    return now.toISOString()
  }

  async handle({ interval, user, repo, branch }, { authorFilter }) {
    let commitCount
    if (authorFilter) {
      const authorFilterRes = await this.fetchAuthorFilter({
        interval,
        user,
        repo,
        branch,
        authorFilter,
      })
      commitCount = this.constructor.transformAuthorFilter(authorFilterRes)
    } else {
      const json = await this.fetch({ interval, user, repo, branch })
      commitCount = this.constructor.transform(json)
    }
    return this.constructor.render({ interval, commitCount, authorFilter })
  }
}
