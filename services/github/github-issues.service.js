import gql from 'graphql-tag'
import Joi from 'joi'
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
  'issues-pr-closed': true,
}

const isClosedVariant = {
  'issues-closed': true,
  'issues-pr-closed': true,
}

export default class GithubIssues extends GithubAuthV4Service {
  static category = 'issue-tracking'
  static route = {
    base: 'github',
    pattern:
      ':variant(issues|issues-closed|issues-pr|issues-pr-closed):raw(-raw)?/:user/:repo/:label*',
  }

  static examples = [
    {
      title: 'GitHub issues',
      pattern: 'issues/:user/:repo',
      namedParams: {
        user: 'badges',
        repo: 'shields',
      },
      staticPreview: {
        label: 'issues',
        message: '167 open',
        color: 'yellow',
      },
      documentation,
    },
    {
      title: 'GitHub issues',
      pattern: 'issues-raw/:user/:repo',
      namedParams: {
        user: 'badges',
        repo: 'shields',
      },
      staticPreview: {
        label: 'open issues',
        message: '167',
        color: 'yellow',
      },
      documentation,
    },
    {
      title: 'GitHub issues by-label',
      pattern: 'issues/:user/:repo/:label',
      namedParams: {
        user: 'badges',
        repo: 'shields',
        label: 'service-badge',
      },
      staticPreview: {
        label: 'service-badge issues',
        message: '110 open',
        color: 'yellow',
      },
      documentation,
    },
    {
      title: 'GitHub issues by-label',
      pattern: 'issues-raw/:user/:repo/:label',
      namedParams: {
        user: 'badges',
        repo: 'shields',
        label: 'service-badge',
      },
      staticPreview: {
        label: 'open service-badge issues',
        message: '110',
        color: 'yellow',
      },
      documentation,
    },
    {
      title: 'GitHub closed issues',
      pattern: 'issues-closed/:user/:repo',
      namedParams: {
        user: 'badges',
        repo: 'shields',
      },
      staticPreview: {
        label: 'issues',
        message: '899 closed',
        color: 'yellow',
      },
      documentation,
    },
    {
      title: 'GitHub closed issues',
      pattern: 'issues-closed-raw/:user/:repo',
      namedParams: {
        user: 'badges',
        repo: 'shields',
      },
      staticPreview: {
        label: 'closed issues',
        message: '899',
        color: 'yellow',
      },
      documentation,
    },
    {
      title: 'GitHub closed issues by-label',
      pattern: 'issues-closed/:user/:repo/:label',
      namedParams: {
        user: 'badges',
        repo: 'shields',
        label: 'service-badge',
      },
      staticPreview: {
        label: 'service-badge issues',
        message: '452 closed',
        color: 'yellow',
      },
      documentation,
    },
    {
      title: 'GitHub closed issues by-label',
      pattern: 'issues-closed-raw/:user/:repo/:label',
      namedParams: {
        user: 'badges',
        repo: 'shields',
        label: 'service-badge',
      },
      staticPreview: {
        label: 'closed service-badge issues',
        message: '452',
        color: 'yellow',
      },
      documentation,
    },
    {
      title: 'GitHub pull requests',
      pattern: 'issues-pr/:user/:repo',
      namedParams: {
        user: 'cdnjs',
        repo: 'cdnjs',
      },
      staticPreview: {
        label: 'pull requests',
        message: '136 open',
        color: 'yellow',
      },
      keywords: ['pullrequest', 'pr'],
      documentation,
    },
    {
      title: 'GitHub pull requests',
      pattern: 'issues-pr-raw/:user/:repo',
      namedParams: {
        user: 'cdnjs',
        repo: 'cdnjs',
      },
      staticPreview: {
        label: 'open pull requests',
        message: '136',
        color: 'yellow',
      },
      keywords: ['pullrequest', 'pr'],
      documentation,
    },
    {
      title: 'GitHub closed pull requests',
      pattern: 'issues-pr-closed/:user/:repo',
      namedParams: {
        user: 'cdnjs',
        repo: 'cdnjs',
      },
      staticPreview: {
        label: 'pull requests',
        message: '7k closed',
        color: 'yellow',
      },
      keywords: ['pullrequest', 'pr'],
      documentation,
    },
    {
      title: 'GitHub closed pull requests',
      pattern: 'issues-pr-closed-raw/:user/:repo',
      namedParams: {
        user: 'cdnjs',
        repo: 'cdnjs',
      },
      staticPreview: {
        label: 'closed pull requests',
        message: '7k',
        color: 'yellow',
      },
      keywords: ['pullrequest', 'pr'],
      documentation,
    },
    {
      title: 'GitHub pull requests by-label',
      pattern: 'issues-pr/:user/:repo/:label',
      namedParams: {
        user: 'badges',
        repo: 'shields',
        label: 'service-badge',
      },
      staticPreview: {
        label: 'service-badge pull requests',
        message: '8 open',
        color: 'yellow',
      },
      keywords: ['pullrequest', 'pr'],
      documentation,
    },
    {
      title: 'GitHub pull requests by-label',
      pattern: 'issues-pr-raw/:user/:repo/:label',
      namedParams: {
        user: 'badges',
        repo: 'shields',
        label: 'service-badge',
      },
      staticPreview: {
        label: 'open service-badge pull requests',
        message: '8',
        color: 'yellow',
      },
      keywords: ['pullrequest', 'pr'],
      documentation,
    },
    {
      title: 'GitHub closed pull requests by-label',
      pattern: 'issues-pr-closed/:user/:repo/:label',
      namedParams: {
        user: 'badges',
        repo: 'shields',
        label: 'service-badge',
      },
      staticPreview: {
        label: 'service-badge pull requests',
        message: '835 closed',
        color: 'yellow',
      },
      keywords: ['pullrequest', 'pr'],
      documentation,
    },
    {
      title: 'GitHub closed pull requests by-label',
      pattern: 'issues-pr-closed-raw/:user/:repo/:label',
      namedParams: {
        user: 'badges',
        repo: 'shields',
        label: 'service-badge',
      },
      staticPreview: {
        label: 'closed service-badge pull requests',
        message: '835',
        color: 'yellow',
      },
      keywords: ['pullrequest', 'pr'],
      documentation,
    },
  ]

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
      message: `${metric(issueCount)} ${messageSuffix}`,
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

  async handle({ variant, raw, user, repo, label }) {
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
