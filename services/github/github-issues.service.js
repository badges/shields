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
  'issues-pr-merged': true,
  'issues-pr-closed-unmerged': true,
}

const isClosedVariant = {
  'issues-closed': true,
  'issues-pr-closed': true,
  'issues-pr-closed-unmerged': true,
}

const isMergedVariant = {
  'issues-pr-merged': true,
}

const isUnmergedVariant = {
  'issues-pr-closed-unmerged': true,
}

export default class GithubIssues extends GithubAuthV4Service {
  static category = 'issue-tracking'
  static route = {
    base: 'github',
    pattern:
      ':variant(issues|issues-closed|issues-pr|issues-pr-merged|issues-pr-closed-unmerged|issues-pr-closed):raw(-raw)?/:user/:repo/:label*',
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
      title: 'GitHub merged pull requests',
      pattern: 'issues-pr-merged/:user/:repo',
      namedParams: {
        user: 'cdnjs',
        repo: 'cdnjs',
      },
      staticPreview: {
        label: 'pull requests',
        message: '6k merged',
        color: 'yellow',
      },
      keywords: ['pullrequest', 'pr'],
      documentation,
    },
    {
      title: 'GitHub merged pull requests',
      pattern: 'issues-pr-merged-raw/:user/:repo',
      namedParams: {
        user: 'cdnjs',
        repo: 'cdnjs',
      },
      staticPreview: {
        label: 'merged pull requests',
        message: '6k',
        color: 'yellow',
      },
      keywords: ['pullrequest', 'pr'],
      documentation,
    },
    {
      title: 'GitHub closed unmerged pull requests',
      pattern: 'issues-pr-closed-unmerged/:user/:repo',
      namedParams: {
        user: 'cdnjs',
        repo: 'cdnjs',
      },
      staticPreview: {
        label: 'pull requests',
        message: '2k closed unmerged',
        color: 'yellow',
      },
      keywords: ['pullrequest', 'pr'],
      documentation,
    },
    {
      title: 'GitHub closed unmerged pull requests',
      pattern: 'issues-pr-closed-unmerged-raw/:user/:repo',
      namedParams: {
        user: 'cdnjs',
        repo: 'cdnjs',
      },
      staticPreview: {
        label: 'closed unmerged pull requests',
        message: '2k',
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
    {
      title: 'GitHub merged pull requests by-label',
      pattern: 'issues-pr-merged/:user/:repo/:label',
      namedParams: {
        user: 'badges',
        repo: 'shields',
        label: 'service-badge',
      },
      staticPreview: {
        label: 'service-badge pull requests',
        message: '800 merged',
        color: 'yellow',
      },
      keywords: ['pullrequest', 'pr'],
      documentation,
    },
    {
      title: 'GitHub merged pull requests by-label',
      pattern: 'issues-pr-merged-raw/:user/:repo/:label',
      namedParams: {
        user: 'badges',
        repo: 'shields',
        label: 'service-badge',
      },
      staticPreview: {
        label: 'merged service-badge pull requests',
        message: '800',
        color: 'yellow',
      },
      keywords: ['pullrequest', 'pr'],
      documentation,
    },
    {
      title: 'GitHub closed unmerged pull requests by-label',
      pattern: 'issues-pr-closed-unmerged/:user/:repo/:label',
      namedParams: {
        user: 'badges',
        repo: 'shields',
        label: 'service-badge',
      },
      staticPreview: {
        label: 'service-badge pull requests',
        message: '800 unmerged',
        color: 'yellow',
      },
      keywords: ['pullrequest', 'pr'],
      documentation,
    },
    {
      title: 'GitHub closed unmerged pull requests by-label',
      pattern: 'issues-pr-closed-unmerged-raw/:user/:repo/:label',
      namedParams: {
        user: 'badges',
        repo: 'shields',
        label: 'service-badge',
      },
      staticPreview: {
        label: 'closed unmerged service-badge pull requests',
        message: '800',
        color: 'yellow',
      },
      keywords: ['pullrequest', 'pr'],
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'issues', color: 'informational' }

  static render({
    isPR,
    isClosed,
    isMerged,
    isUnmerged,
    issueCount,
    raw,
    label,
  }) {
    let state

    if (isMerged) {
      state = 'merged'
    } else if (isUnmerged) {
      state = 'closed unmerged'
    } else if (isClosed) {
      state = 'closed'
    } else {
      state = 'open'
    }

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

  async fetch({ isPR, isClosed, isMerged, isUnmerged, user, repo, label }) {
    const commonVariables = {
      user,
      repo,
      labels: label ? [label] : undefined,
    }
    if (isPR) {
      let determinedStates

      if (isMerged) {
        determinedStates = ['MERGED']
      } else if (isUnmerged) {
        determinedStates = ['CLOSED']
      } else if (isClosed) {
        determinedStates = ['MERGED', 'CLOSED']
      } else {
        determinedStates = ['OPEN']
      }

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
          states: determinedStates,
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
    const isMerged = isMergedVariant[variant]
    const isUnmerged = isUnmergedVariant[variant]

    const { issueCount } = await this.fetch({
      isPR,
      isClosed,
      isMerged,
      isUnmerged,
      user,
      repo,
      label,
    })
    return this.constructor.render({
      isPR,
      isClosed,
      isMerged,
      isUnmerged,
      issueCount,
      raw,
      label,
    })
  }
}
