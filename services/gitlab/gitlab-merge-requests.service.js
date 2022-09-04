import Joi from 'joi'
import { optionalUrl, nonNegativeInteger } from '../validators.js'
import { metric } from '../text-formatters.js'
import { documentation, errorMessagesFor } from './gitlab-helper.js'
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
<p>
  <a href="https://docs.gitlab.com/ee/user/gitlab_com/index.html#pagination-response-headers">GitLab's API </a> only reports up to 10k Merge Requests, so badges for projects that have more than 10k will not have an exact count.
</p>
`

const labelText = `
<p>
  If you want to use multiple labels then please use commas (<code>,</code>) to separate them, e.g. <code>foo,bar</code>.
</p>
`

const defaultDocumentation = documentation + more

const labelDocumentation = documentation + labelText + more

export default class GitlabMergeRequests extends GitLabBase {
  static category = 'issue-tracking'

  static route = {
    base: 'gitlab/merge-requests',
    pattern: ':variant(all|open|closed|locked|merged):raw(-raw)?/:project+',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitLab merge requests',
      pattern: 'open/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: { gitlab_url: 'https://gitlab.com' },
      staticPreview: {
        label: 'merge requests',
        message: '1.4k open',
        color: 'blue',
      },
      documentation: defaultDocumentation,
    },
    {
      title: 'GitLab merge requests',
      pattern: 'open-raw/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: { gitlab_url: 'https://gitlab.com' },
      staticPreview: {
        label: 'open merge requests',
        message: '1.4k',
        color: 'blue',
      },
      documentation: defaultDocumentation,
    },
    {
      title: 'GitLab merge requests by-label',
      pattern: 'open/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: {
        labels: 'test,type::feature',
        gitlab_url: 'https://gitlab.com',
      },
      staticPreview: {
        label: 'test,failure::new merge requests',
        message: '3 open',
        color: 'blue',
      },
      documentation: labelDocumentation,
    },
    {
      title: 'GitLab merge requests by-label',
      pattern: 'open-raw/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: {
        labels: 'gitlab-org/gitlab',
        gitlab_url: 'https://gitlab.com',
      },
      staticPreview: {
        label: 'open test,failure::new merge requests',
        message: '3',
        color: 'blue',
      },
      documentation: labelDocumentation,
    },
    {
      title: 'GitLab closed merge requests',
      pattern: 'closed/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: { gitlab_url: 'https://gitlab.com' },
      staticPreview: {
        label: 'merge requests',
        message: 'more than 10k closed',
        color: 'blue',
      },
      documentation: defaultDocumentation,
    },
    {
      title: 'GitLab closed merge requests',
      pattern: 'closed-raw/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: { gitlab_url: 'https://gitlab.com' },
      staticPreview: {
        label: 'closed merge requests',
        message: 'more than 10k',
        color: 'blue',
      },
      documentation: defaultDocumentation,
    },
    {
      title: 'GitLab closed merge requests by-label',
      pattern: 'closed/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: {
        labels: 'test,type::feature',
        gitlab_url: 'https://gitlab.com',
      },
      staticPreview: {
        label: 'test,failure::new merge requests',
        message: '32 closed',
        color: 'blue',
      },
      documentation: labelDocumentation,
    },
    {
      title: 'GitLab closed merge requests by-label',
      pattern: 'closed-raw/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: {
        labels: 'test,type::feature',
        gitlab_url: 'https://gitlab.com',
      },
      staticPreview: {
        label: 'closed test,failure::new merge requests',
        message: '32',
        color: 'blue',
      },
      documentation: labelDocumentation,
    },
    {
      title: 'GitLab all merge requests',
      pattern: 'all/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: { gitlab_url: 'https://gitlab.com' },
      staticPreview: {
        label: 'merge requests',
        message: 'more than 10k all',
        color: 'blue',
      },
      documentation: defaultDocumentation,
    },
    {
      title: 'GitLab all merge requests',
      pattern: 'all-raw/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: { gitlab_url: 'https://gitlab.com' },
      staticPreview: {
        label: 'all merge requests',
        message: 'more than 10k',
        color: 'blue',
      },
      documentation: defaultDocumentation,
    },
    {
      title: 'GitLab all merge requests by-label',
      pattern: 'all-raw/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: {
        labels: 'test,failure::new',
        gitlab_url: 'https://gitlab.com',
      },
      staticPreview: {
        label: 'all test,failure::new merge requests',
        message: '12',
        color: 'blue',
      },
      documentation: labelDocumentation,
    },
    {
      title: 'GitLab locked merge requests',
      pattern: 'locked/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: { gitlab_url: 'https://gitlab.com' },
      staticPreview: {
        label: 'merge requests',
        message: '0 locked',
        color: 'blue',
      },
      documentation: defaultDocumentation,
    },
    {
      title: 'GitLab locked merge requests by-label',
      pattern: 'closed/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: {
        labels: 'test,type::feature',
        gitlab_url: 'https://gitlab.com',
      },
      staticPreview: {
        label: 'test,failure::new merge requests',
        message: '0 locked',
        color: 'blue',
      },
      documentation: labelDocumentation,
    },
    {
      title: 'GitLab merged merge requests',
      pattern: 'merged/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: { gitlab_url: 'https://gitlab.com' },
      staticPreview: {
        label: 'merge requests',
        message: 'more than 10k merged',
        color: 'blue',
      },
      documentation: defaultDocumentation,
    },
    {
      title: 'GitLab merged merge requests by-label',
      pattern: 'merged/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: {
        labels: 'test,type::feature',
        gitlab_url: 'https://gitlab.com',
      },
      staticPreview: {
        label: 'test,failure::new merge requests',
        message: '68 merged',
        color: 'blue',
      },
      documentation: labelDocumentation,
    },
  ]

  static defaultBadgeData = { label: 'merge requests' }

  static render({ variant, raw, labels, mergeRequestCount }) {
    const state = variant
    const isMultiLabel = labels && labels.includes(',')
    const labelText = labels ? `${isMultiLabel ? `${labels}` : labels} ` : ''

    let labelPrefix = ''
    let messageSuffix = ''
    if (raw !== undefined) {
      labelPrefix = `${state} `
    } else {
      messageSuffix = state
    }
    const message = `${mergeRequestCount > 10000 ? 'more than ' : ''}${metric(
      mergeRequestCount
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
          project
        )}/merge_requests`,
        options: {
          searchParams: {
            state: variant === 'open' ? 'opened' : variant,
            page: '1',
            per_page: '1',
            labels,
          },
        },
        errorMessages: errorMessagesFor('project not found'),
      })
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
    { variant, raw, project },
    { gitlab_url: baseUrl = 'https://gitlab.com', labels }
  ) {
    const data = await this.fetch({
      project,
      baseUrl,
      variant,
      labels,
    })
    const mergeRequestCount = this.constructor.transform(data)
    return this.constructor.render({
      variant,
      raw,
      labels,
      mergeRequestCount,
    })
  }
}
