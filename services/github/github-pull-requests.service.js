PARTA
import gql from 'graphql-tag'
import Joi from 'joi'
import { pathParams, queryParam } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV4Service } from './github-auth-service.js'
import { documentation, transformErrors } from './github-helpers.js

const pullRequestCountSchema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      pullRequests: Joi.object({
        totalCount: nonNegativeInteger,
      }).required(),
    }).required(),
  }).required(),
}).required()

const pullRequestDiffCountSchema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      pullRequest: Joi.object({
        additions: nonNegativeInteger,
        deletions: nonNegativeInteger,
      }).required(),
    }).required(),
  }).required(),
}).required()

const pullRequestSearchSchema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      id: Joi.string().required(),
    }).required(),
    search: Joi.object({
      issueCount: nonNegativeInteger,
    }).required(),
  }).required(),
}).required()

const queryParamSchema = Joi.object({
  excludeDrafts: Joi.equal(''),
  onlyDrafts: Joi.equal(''),
})
  .oxor('excludeDrafts', 'onlyDrafts')
  .required()

const pullRequestVariants = [
  'issues-pr',
  'issues-pr-raw',
  'issues-pr-closed',
  'issues-pr-closed-raw',
]

const variantSummaries = {
  'issues-pr': 'GitHub Pull Requests',
  'issues-pr-raw': 'GitHub Pull Requests (raw)',
  'issues-pr-closed': 'GitHub Closed Pull Requests',
  'issues-pr-closed-raw': 'GitHub Closed Pull Requests (raw)',
}
function openApiRoute({ variant, label }) {
  return {
    get: {
      summary: variantSummaries[variant] + (label ? ' by label' : ''),
      description: documentation,
      parameters: [
        ...pathParams(
          { name: 'user', example: 'badges' },
          { name: 'repo', example: 'shields' },
          ...(label ? [{ name: 'label', example: 'service-badge' }] : []),
        ),
        queryParam({
          name: 'excludeDrafts',
          description: 'Exclude draft pull requests',
          example: null,
          schema: { type: 'boolean' },
        }),
        queryParam({
          name: 'onlyDrafts',
          description: 'Only include draft pull requests',
          example: null,
          schema: { type: 'boolean' },
        }),
      ],
    },
  }
}

const openApi = Object.fromEntries(
  pullRequestVariants.flatMap(variant => [
    [
      '/github/' + variant + '/{user}/{repo}',
      openApiRoute({ variant, label: false }),
    ],
    [
      '/github/' + variant + '/{user}/{repo}/{label}',
      openApiRoute({ variant, label: true }),
    ],
    [
      '/github/pr-diff/{user}/{repo}/{number}',
      {
        get: {
          summary: 'GitHub pull request additions and deletions',
          description: documentation,
          parameters: pathParams(
            { name: 'user', example: 'badges' },
            { name: 'repo', example: 'shields' },
            { name: 'number', example: '3459' },
          ),
        },
      },
    ],
  ]),
)

export default class GithubPullRequests extends GithubAuthV4Service {
  static category = 'issue-tracking'
  static route = {
    base: 'github',
    pattern:
      ':variant(issues-pr|issues-pr-raw|issues-pr-closed|issues-pr-closed-raw|pr-diff)/:user/:repo/:number*',
    queryParamSchema,
  }

  static openApi = openApi

  static defaultBadgeData = {
    label: 'pull requests',
    color: 'informational',
  }

  render({ additions, deletions }) {
    return {
      label: 'PR',
      message: '+' + metric(additions) + ' -' + metric(deletions),
      color: 'informational',
    }
  }

  async fetchDiff(user, repo, number) {
    const {
      data: {
        repository: {
          pullRequest: { additions, deletions },
        },
      },
    } = await this._requestGraphql({
      query: gql`
        query (
          $user: String!
          $repo: String!
          $number: Int!
        ) {
          repository(owner: $user, name: $repo) {
            pullRequest(number: $number) {
              additions
              deletions
            }
          }
        }
      `,
      variables: { user, repo, number },
      schema: pullRequestDiffCountSchema,
      transformErrors,
    })
    return { additions, deletions }
  }
  async fetch({ user, repo, label, isClosed, excludeDrafts, onlyDrafts }) {
    if (!excludeDrafts && !onlyDrafts) {
      const {
        data: {
          repository: {
            pullRequests: { totalCount },
          },
        },
      } = await this._requestGraphql({
        query: gql`
          query (
            $user: String!
            $repo: String!
            $states: [PullRequestState!]
            $labels: [String!]
          ) {
            repository(owner: $user, name: $repo) {
              pullRequests(states: $states, labels: $labels) {
                totalCount
              }
            }
          }
        `,
        variables: {
          user,
          repo,
          states: isClosed ? ['MERGED', 'CLOSED'] : ['OPEN'],
          labels: label ? [label] : undefined,
        },
        schema: pullRequestCountSchema,
        transformErrors,
      })
      return totalCount
    }

    const searchQualifiers = [
      'repo:' + user + '/' + repo,
      'is:pr',
      'is:' + (isClosed ? 'closed' : 'open'),
    ]
    if (label) {
      searchQualifiers.push('label:"' + label + '"')
    }
    if (excludeDrafts) {
      searchQualifiers.push('draft:false')
    }
    if (onlyDrafts) {
      searchQualifiers.push('draft:true')
    }

    const data = await this._requestGraphql({
      query: gql`
        query ($query: String!, $user: String!, $repo: String!) {
          repository(owner: $user, name: $repo) {
            id
          }
          search(query: $query, type: ISSUE) {
            issueCount
          }
        }
      `,
      variables: { query: searchQualifiers.join(' '), user, repo },
      schema: pullRequestSearchSchema,
      transformErrors,
    })

    return data.data.search.issueCount
  }

  async handle({ variant, user, repo, label, number }, queryParams) {
    if (variant === 'pr-diff') {
      const { additions, deletions } = await this.fetchDiff(user, repo, Number(number))
      return this.constructor.render({ additions, deletions })
    }
    const raw = variant.endsWith('-raw')
    const isClosed = variant.includes('-closed')
    const excludeDrafts = queryParams.excludeDrafts !== undefined
    const onlyDrafts = queryParams.onlyDrafts !== undefined
    const issueCount = await this.fetch({
      user,
      repo,
      label,
      isClosed,
      excludeDrafts,
      onlyDrafts,
    })
    return this.constructor.render({
      issueCount,
      label,
      raw,
      isClosed,
      excludeDrafts,
      onlyDrafts,
    })
  }
}
