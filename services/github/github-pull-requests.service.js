import gql from 'graphql-tag'
import Joi from 'joi'
import { pathParams, queryParam } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV4Service } from './github-auth-service.js'
import { documentation, transformErrors } from './github-helpers.js'

const pullRequestCountSchema = Joi.object({
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
      summary: `${variantSummaries[variant]}${label ? ' by label' : ''}`,
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
      `/github/${variant}/{user}/{repo}`,
      openApiRoute({ variant, label: false }),
    ],
    [
      `/github/${variant}/{user}/{repo}/{label}`,
      openApiRoute({ variant, label: true }),
    ],
  ]),
)

export default class GithubPullRequests extends GithubAuthV4Service {
  static category = 'issue-tracking'
  static route = {
    base: 'github',
    pattern:
      ':variant(issues-pr|issues-pr-raw|issues-pr-closed|issues-pr-closed-raw)/:user/:repo/:label*',
    queryParamSchema,
  }

  static openApi = openApi

  static defaultBadgeData = {
    label: 'pull requests',
    color: 'informational',
  }

  static render({
    issueCount,
    label,
    raw,
    isClosed,
    excludeDrafts,
    onlyDrafts,
  }) {
    const state = isClosed ? 'closed' : 'open'
    const isGhLabelMultiWord = label && label.includes(' ')
    const labelText = label
      ? `${isGhLabelMultiWord ? `"${label}"` : label} `
      : ''
    let draftText = ''
    if (excludeDrafts) {
      draftText = 'non-drafts '
    } else if (onlyDrafts) {
      draftText = 'drafts '
    }

    return {
      label: `${raw ? `${state} ` : ''}${labelText}${draftText}pull requests`,
      message: `${metric(issueCount)}${raw ? '' : ` ${state}`}`,
      color: issueCount > 0 ? 'yellow' : 'brightgreen',
    }
  }

  async fetch({ user, repo, label, isClosed, excludeDrafts, onlyDrafts }) {
    const searchQualifiers = [
      `repo:${user}/${repo}`,
      'is:pr',
      `is:${isClosed ? 'closed' : 'open'}`,
    ]
    if (label) {
      searchQualifiers.push(`label:"${label}"`)
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
      schema: pullRequestCountSchema,
      transformErrors,
    })

    return data.data.search.issueCount
  }

  async handle({ variant, user, repo, label }, queryParams) {
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
