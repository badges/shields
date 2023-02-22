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

const queryParamSchema = Joi.object({
  query: Joi.string().required(),
  withRawSuffix: Joi.equal(''),
}).required()

const isPRVariant = {
  prs: true,
}

function extractCategoryFromQuery(category, query) {
  if (!query) {
    return null
  }

  return query
    .split(' ')
    .filter(word => word.contains(`${category}:`))
    .map(label => label.replace(`${category}:`, ''))
}

export default class GithubIssuesGeneric extends GithubAuthV4Service {
  static category = 'issue-tracking'
  static route = {
    base: 'github',
    pattern: 'issues-generic/:user/:repo/:variant(issues|prs)',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitHub issues',
      pattern: 'issues-generic/:user/:repo/issues',
      namedParams: {
        user: 'badges',
        repo: 'shields',
      },
      queryParams: { query: 'is:open is:issue' },
      staticPreview: {
        label: 'open issues',
        message: '167',
        color: 'yellow',
      },
      documentation,
    },
    {
      title: 'GitHub closed pull requests',
      pattern: 'issues-generic/:user/:repo/prs',
      namedParams: {
        user: 'badges',
        repo: 'shields',
      },
      queryParams: { query: 'is:closed is:pr', withRawSuffix: null },
      staticPreview: {
        label: 'pull requests',
        message: '7k closed',
        color: 'yellow',
      },
      keywords: ['pullrequest', 'pr'],
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'issues', color: 'informational' }

  static render({ isPR, issueCount, withRawSuffix, isClosed, query }) {
    const state = isClosed ? 'closed' : 'open'

    let labelPrefix = ''
    let messageSuffix = ''
    if (withRawSuffix) {
      messageSuffix = state
    } else {
      labelPrefix = `${state} `
    }

    const labelText = `"${extractCategoryFromQuery('label', query)}"`

    console.log(labelText)
    const labelSuffix = isPR ? 'pull requests' : 'issues'

    return {
      label: `${labelPrefix}${labelText}${labelSuffix}`,
      message: `${metric(issueCount)}${
        messageSuffix ? ' ' : ''
      }${messageSuffix}`,
      color: issueCount > 0 ? 'yellow' : 'brightgreen',
    }
  }

  async fetch({ isPR, user, repo, query, isClosed }) {
    const labels = extractCategoryFromQuery('label', query)
    const authors = extractCategoryFromQuery('author', query)
    const reviews = extractCategoryFromQuery('review', query)

    console.log('LAR:', labels, authors, reviews)

    const commonVariables = {
      user,
      repo,
      labels: labels ? [labels] : undefined,
      authors: authors ? [authors] : undefined,
      reviews: reviews ? [reviews] : undefined,
      isClosed,
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
            $authors: [String!]
            $reviews: [String!]
          ) {
            repository(owner: $user, name: $repo) {
              pullRequests(
                states: $states
                labels: $labels
                authors: $authors
                reviews: $reviews
              ) {
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
            $authors: [String!]
            $reviews: [String!]
          ) {
            repository(owner: $user, name: $repo) {
              issues(
                states: $states
                labels: $labels
                authors: $authors
                reviews: $reviews
              ) {
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

  async handle({ user, repo, variant, query, withRawSuffix }) {
    const isPR = isPRVariant[variant]
    const isClosed = query ? query.includes('is:closed') : null
    console.log('isClosed', isClosed)
    const { issueCount } = await this.fetch({
      isPR,
      user,
      repo,
      query,
      isClosed,
    })
    return this.constructor.render({
      isPR,
      issueCount,
      withRawSuffix,
      isClosed,
      query,
    })
  }
}
