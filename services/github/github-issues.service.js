import gql from 'graphql-tag'
import Joi from 'joi'
import { pathParams, queryParam } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV4Service } from './github-auth-service.js'
import { documentation, transformErrors } from './github-helpers.js'

const pullRequestCountSchema = Joi.object({
  data: Joi.object({
    search: Joi.object({
      issueCount: nonNegativeInteger,
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

const queryParamSchema = Joi.object({
  excludeDrafts: Joi.boolean(),
  onlyDrafts: Joi.boolean(),
})

export default class GithubIssues extends GithubAuthV4Service {
  static category = 'issue-tracking'
  static route = {
    base: 'github',
    pattern:
      ':variant(issues|issues-raw|issues-closed|issues-closed-raw|issues-pr|issues-pr-raw|issues-pr-closed|issues-pr-closed-raw)/:user/:repo/:label*',
    queryParamSchema,
  }

  static openApi = {
    '/github/{variant}/{user}/{repo}': {
      get: {
        summary: 'GitHub Issues or Pull Requests',
        description: documentation,
        parameters: [
          ...pathParams(
            {
              name: 'variant',
              example: 'issues',
              schema: { type: 'string', enum: this.getEnum('variant') },
            },
            { name: 'user', example: 'badges' },
            { name: 'repo', example: 'shields' },
          ),
          queryParam({
            name: 'excludeDrafts',
            description: 'Exclude draft issues and pull requests',
            schema: { type: 'boolean' },
            required: false,
          }),
          queryParam({
            name: 'onlyDrafts',
            description: 'Only include draft issues and pull requests',
            schema: { type: 'boolean' },
            required: false,
          }),
        ],
      },
    },
    '/github/{variant}/{user}/{repo}/{label}': {
      get: {
        summary: 'GitHub Issues or Pull Requests by label',
        description: documentation,
        parameters: [
          ...pathParams(
            {
              name: 'variant',
              example: 'issues',
              schema: { type: 'string', enum: this.getEnum('variant') },
            },
            { name: 'user', example: 'badges' },
            { name: 'repo', example: 'shields' },
            { name: 'label', example: 'service-badge' },
          ),
          queryParam({
            name: 'excludeDrafts',
            description: 'Exclude draft issues and pull requests',
            schema: { type: 'boolean' },
            required: false,
          }),
          queryParam({
            name: 'onlyDrafts',
            description: 'Only include draft issues and pull requests',
            schema: { type: 'boolean' },
            required: false,
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'issues', color: 'informational' }

  static render({
    isPR,
    isClosed,
    issueCount,
    raw,
    label,
    excludeDrafts,
    onlyDrafts,
  }) {
    const state = isClosed ? 'closed' : 'open'

    let labelPrefix = ''
    let messageSuffix = ''
    if (raw) {
      labelPrefix = `${state} `
    } else {
      messageSuffix = state
    }

    let draftPrefix = ''
    // if both draft:true and draft:false are set in the search query, they cancel each other out
    // so we don't need to add a suffix
    if (excludeDrafts && !onlyDrafts) {
      draftPrefix = 'non-drafts '
    } else if (onlyDrafts && !excludeDrafts) {
      draftPrefix = 'drafts '
    }

    const isGhLabelMultiWord = label && label.includes(' ')
    const labelText = label
      ? `${isGhLabelMultiWord ? `"${label}"` : label} `
      : ''
    const labelSuffix = isPR ? 'pull requests' : 'issues'

    return {
      label: `${labelPrefix}${labelText}${draftPrefix}${labelSuffix}`,
      message: `${metric(issueCount)}${
        messageSuffix ? ' ' : ''
      }${messageSuffix}`,
      color: issueCount > 0 ? 'yellow' : 'brightgreen',
    }
  }

  async fetch({
    isPR,
    isClosed,
    user,
    repo,
    label,
    excludeDrafts,
    onlyDrafts,
  }) {
    let query = `repo:${user}/${repo}`
    query += ` is:${isPR ? 'pr' : 'issue'}`
    query += ` is:${isClosed ? 'closed' : 'open'}`
    query += `${label ? ` label:"${label}"` : ''}`
    query += `${excludeDrafts ? ' draft:false' : ''}`
    query += `${onlyDrafts ? ' draft:true' : ''}`
    const {
      data: {
        search: { issueCount },
      },
    } = await this._requestGraphql({
      // the first part of the query (repository) is used to check if the repo exists
      query: gql`
        query ($query: String!, $user: String!, $repo: String!) {
          repository(owner: $user, name: $repo) {
            issues(states: [OPEN]) {
              totalCount
            }
          }
          search(query: $query, type: ISSUE) {
            issueCount
          }
        }
      `,
      variables: {
        query,
        user,
        repo,
      },
      schema: pullRequestCountSchema,
      transformErrors,
    })
    return { issueCount }
  }

  async handle({ variant, user, repo, label }, { excludeDrafts, onlyDrafts }) {
    const raw = variant.endsWith('-raw')
    const isPR = isPRVariant[variant]
    const isClosed = isClosedVariant[variant]
    const { issueCount } = await this.fetch({
      isPR,
      isClosed,
      user,
      repo,
      label,
      excludeDrafts,
      onlyDrafts,
    })
    return this.constructor.render({
      isPR,
      isClosed,
      issueCount,
      raw,
      label,
      excludeDrafts,
      onlyDrafts,
    })
  }
}
