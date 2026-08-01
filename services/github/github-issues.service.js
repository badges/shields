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

const isClosedVariant = {
  'issues-closed': true,
  'issues-closed-raw': true,
}

export default class GithubIssues extends GithubAuthV4Service {
  static category = 'issue-tracking'
  static route = {
    base: 'github',
    pattern:
      ':variant(issues|issues-raw|issues-closed|issues-closed-raw)/:user/:repo/:label*',
  }

  static openApi = {
    '/github/{variant}/{user}/{repo}': {
      get: {
        summary: 'GitHub Issues',
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
        summary: 'GitHub Issues by label',
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

  static render({ isClosed, issueCount, raw, label }) {
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
    return {
      label: `${labelPrefix}${labelText}issues`,
      message: `${metric(issueCount)}${
        messageSuffix ? ' ' : ''
      }${messageSuffix}`,
      color: issueCount > 0 ? 'yellow' : 'brightgreen',
    }
  }

  async fetch({ isClosed, user, repo, label }) {
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
        user,
        repo,
        labels: label ? [label] : undefined,
        states: isClosed ? ['CLOSED'] : ['OPEN'],
      },
      schema: issueCountSchema,
      transformErrors,
    })
    return { issueCount: totalCount }
  }

  async handle({ variant, user, repo, label }) {
    const raw = variant.endsWith('-raw')
    const isClosed = isClosedVariant[variant]
    const { issueCount } = await this.fetch({
      isClosed,
      user,
      repo,
      label,
    })
    return this.constructor.render({
      isClosed,
      issueCount,
      raw,
      label,
    })
  }
}
