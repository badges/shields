import gql from 'graphql-tag'
import Joi from 'joi'
import { pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV4Service } from './github-auth-service.js'
import { documentation, transformErrors } from './github-helpers.js'

const issueCountSchema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      issues: Joi.object({
        totalCount: nonNegativeInteger,
      }).required(),
    }).required(),
  }).required(),
}).required()

const pullRequestCountSchema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      pullRequests: Joi.object({
        totalCount: nonNegativeInteger,
      }).required(),
    }).required(),
  }).required(),
}).required()

const isPRVariant = {
  'issues-pr': true,
  'issues-pr-raw': true,
  'issues-pr-closed': true,
  'issues-pr-closed-raw': true,
}

const isClosedVariant = {
  'issues-closed': true,
  'issues-closed-raw': true,
  'issues-pr-closed': true,
  'issues-pr-closed-raw': true,
}

export default class GithubIssues extends GithubAuthV4Service {
  static category = 'issue-tracking'
  static route = {
    base: 'github',
    pattern:
      ':variant(issues|issues-raw|issues-closed|issues-closed-raw|issues-pr|issues-pr-raw|issues-pr-closed|issues-pr-closed-raw)/:user/:repo/:label*',
  }

  static openApi = {
    '/github/{variant}/{user}/{repo}': {
      get: {
        summary: 'GitHub Issues or Pull Requests',
        description: documentation,
        parameters: pathParams(
          {
            name: 'variant',
            example: 'issues',
            schema: { type: 'string', enum: this.getEnum('variant') },
          },
          { name: 'user', example: 'badges' },
          { name: 'repo', example: 'shields' },
        ),
      },
    },
    '/github/{variant}/{user}/{repo}/{label}': {
      get: {
        summary: 'GitHub Issues or Pull Requests by label',
        description: documentation,
        parameters: pathParams(
          {
            name: 'variant',
            example: 'issues',
            schema: { type: 'string', enum: this.getEnum('variant') },
          },
          { name: 'user', example: 'badges' },
          { name: 'repo', example: 'shields' },
          { name: 'label', example: 'service-badge' },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'issues', color: 'informational' }

  static render({ isPR, isClosed, issueCount, raw, label }) {
    const state = isClosed ? 'closed' : 'open'

    let labelPrefix = ''
    let messageSuffix = ''
    if (raw) {
      labelPrefix = `${state} `
    } else {
      messageSuffix = state
    }

    const isGhLabelMultiWord = label && label.includes(' ')
    const labelText = label
      ? `${isGhLabelMultiWord ? `"${label}"` : label} `
      : ''
    const labelSuffix = isPR ? 'pull requests' : 'issues'

    return {
      label: `${labelPrefix}${labelText}${labelSuffix}`,
      message: `${metric(issueCount)}${
        messageSuffix ? ' ' : ''
      }${messageSuffix}`,
      color: issueCount > 0 ? 'yellow' : 'brightgreen',
    }
  }

  async fetch({ isPR, isClosed, user, repo, label }) {
    const commonVariables = {
      user,
      repo,
      labels: label ? [label] : undefined,
    }
    if (isPR) {
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
          ...commonVariables,
          states: isClosed ? ['MERGED', 'CLOSED'] : ['OPEN'],
        },
        schema: pullRequestCountSchema,
        transformErrors,
      })
      return { issueCount: totalCount }
    } else {
      const {
        data: {
          repository: {
            issues: { totalCount },
          },
        },
      } = await this._requestGraphql({
        query: gql`
          query (
            $user: String!
            $repo: String!
            $states: [IssueState!]
            $labels: [String!]
          ) {
            repository(owner: $user, name: $repo) {
              issues(states: $states, labels: $labels) {
                totalCount
              }
            }
          }
        `,
        variables: {
          ...commonVariables,
          states: isClosed ? ['CLOSED'] : ['OPEN'],
        },
        schema: issueCountSchema,
        transformErrors,
      })
      return { issueCount: totalCount }
    }
  }

  async handle({ variant, user, repo, label }) {
    const raw = variant.endsWith('-raw')
    const isPR = isPRVariant[variant]
    const isClosed = isClosedVariant[variant]
    const { issueCount } = await this.fetch({
      isPR,
      isClosed,
      user,
      repo,
      label,
    })
    return this.constructor.render({
      isPR,
      isClosed,
      issueCount,
      raw,
      label,
    })
  }
}
