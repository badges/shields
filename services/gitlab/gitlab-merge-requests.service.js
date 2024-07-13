import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { optionalUrl, nonNegativeInteger } from '../validators.js'
import { metric } from '../text-formatters.js'
import { description, httpErrorsFor } from './gitlab-helper.js'
import GitLabBase from './gitlab-base.js'

// The total number of MR is in the `x-total` field in the headers.
// https://docs.gitlab.com/ee/api/index.html#other-pagination-headers
const schema = Joi.object({
  'x-total': Joi.number().integer(),
  'x-page': nonNegativeInteger,
})

const queryParamSchema = Joi.object({
  labels: Joi.string(),
  gitlab_url: optionalUrl,
}).required()

const more = `
<a href="https://docs.gitlab.com/ee/user/gitlab_com/index.html#pagination-response-headers">GitLab's API </a> only reports up to 10k Merge Requests, so badges for projects that have more than 10k will not have an exact count.
`

const mergeRequestsDescription = description + more

export default class GitlabMergeRequests extends GitLabBase {
  static category = 'issue-tracking'

  static route = {
    base: 'gitlab/merge-requests',
    pattern:
      ':variant(all|all-raw|open|open-raw|closed|closed-raw|locked|locked-raw|merged|merged-raw)/:project+',
    queryParamSchema,
  }

  static openApi = {
    '/gitlab/merge-requests/{variant}/{project}': {
      get: {
        summary: 'GitLab Merge Requests',
        description: mergeRequestsDescription,
        parameters: [
          pathParam({
            name: 'variant',
            example: 'all',
            schema: { type: 'string', enum: this.getEnum('variant') },
          }),
          pathParam({
            name: 'project',
            example: 'gitlab-org/gitlab',
          }),
          queryParam({
            name: 'gitlab_url',
            example: 'https://gitlab.com',
          }),
          queryParam({
            name: 'labels',
            example: 'test,type::feature',
            description:
              'If you want to use multiple labels, you can use a comma (<code>,</code>) to separate them, e.g. <code>foo,bar</code>',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'merge requests' }

  static render({ variant, raw, labels, mergeRequestCount }) {
    const state = variant
    const isMultiLabel = labels && labels.includes(',')
    const labelText = labels ? `${isMultiLabel ? `${labels}` : labels} ` : ''

    let labelPrefix = ''
    let messageSuffix = ''
    if (raw) {
      labelPrefix = `${state} `
    } else {
      messageSuffix = state
    }
    const message = `${mergeRequestCount > 10000 ? 'more than ' : ''}${metric(
      mergeRequestCount,
    )}${messageSuffix ? ' ' : ''}${messageSuffix}`
    return {
      label: `${labelPrefix}${labelText}merge requests`,
      message,
      color: 'blue',
    }
  }

  async fetch({ project, baseUrl, variant, labels }) {
    // https://docs.gitlab.com/ee/api/merge_requests.html#list-project-merge-requests
    const { res } = await this._request(
      this.authHelper.withBearerAuthHeader({
        url: `${baseUrl}/api/v4/projects/${encodeURIComponent(
          project,
        )}/merge_requests`,
        options: {
          searchParams: {
            state: variant === 'open' ? 'opened' : variant,
            page: '1',
            per_page: '1',
            labels,
          },
        },
        httpErrors: httpErrorsFor('project not found'),
      }),
    )
    return this.constructor._validate(res.headers, schema)
  }

  static transform(data) {
    if (data['x-total'] !== undefined) {
      return data['x-total']
    } else {
      // https://docs.gitlab.com/ee/api/index.html#pagination-response-headers
      // For performance reasons, if a query returns more than 10,000 records, GitLab doesn’t return `x-total` header.
      // Displayed on the page as "more than 10k".
      return 10001
    }
  }

  async handle(
    { variant, project },
    { gitlab_url: baseUrl = 'https://gitlab.com', labels },
  ) {
    const data = await this.fetch({
      project,
      baseUrl,
      variant: variant.split('-')[0],
      labels,
    })
    const mergeRequestCount = this.constructor.transform(data)
    return this.constructor.render({
      variant: variant.split('-')[0],
      raw: variant.endsWith('-raw'),
      labels,
      mergeRequestCount,
    })
  }
}
