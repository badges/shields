import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { optionalUrl, nonNegativeInteger } from '../validators.js'
import { metric } from '../text-formatters.js'
import { description, httpErrorsFor } from './gitlab-helper.js'
import GitLabBase from './gitlab-base.js'

const schema = Joi.object({
  statistics: Joi.object({
    counts: Joi.object({
      all: nonNegativeInteger,
      closed: nonNegativeInteger,
      opened: nonNegativeInteger,
    }).required(),
  }).allow(null),
}).required()

const queryParamSchema = Joi.object({
  labels: Joi.string(),
  gitlab_url: optionalUrl,
}).required()

export default class GitlabIssues extends GitLabBase {
  static category = 'issue-tracking'

  static route = {
    base: 'gitlab/issues',
    pattern: ':variant(all|all-raw|open|open-raw|closed|closed-raw)/:project+',
    queryParamSchema,
  }

  static openApi = {
    '/gitlab/issues/{variant}/{project}': {
      get: {
        summary: 'GitLab Issues',
        description,
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
            example: 'test,failure::new',
            description:
              'If you want to use multiple labels, you can use a comma (<code>,</code>) to separate them, e.g. <code>foo,bar</code>',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'issues', color: 'informational' }

  static render({ variant, raw, labels, issueCount }) {
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
    return {
      label: `${labelPrefix}${labelText}issues`,
      message: `${metric(issueCount)}${
        messageSuffix ? ' ' : ''
      }${messageSuffix}`,
      color: issueCount > 0 ? 'yellow' : 'brightgreen',
    }
  }

  async fetch({ project, baseUrl, labels }) {
    // https://docs.gitlab.com/ee/api/issues_statistics.html#get-project-issues-statistics
    return super.fetch({
      schema,
      url: `${baseUrl}/api/v4/projects/${encodeURIComponent(
        project,
      )}/issues_statistics`,
      options: labels ? { searchParams: { labels } } : undefined,
      httpErrors: httpErrorsFor('project not found'),
    })
  }

  static transform({ variant, statistics }) {
    const state = variant
    let issueCount
    switch (state) {
      case 'open':
      case 'open-raw':
        issueCount = statistics.counts.opened
        break
      case 'closed':
      case 'closed-raw':
        issueCount = statistics.counts.closed
        break
      case 'all':
      case 'all-raw':
        issueCount = statistics.counts.all
        break
    }

    return issueCount
  }

  async handle(
    { variant, project },
    { gitlab_url: baseUrl = 'https://gitlab.com', labels },
  ) {
    const { statistics } = await this.fetch({
      project,
      baseUrl,
      labels,
    })
    return this.constructor.render({
      variant: variant.split('-')[0],
      raw: variant.endsWith('-raw'),
      labels,
      issueCount: this.constructor.transform({ variant, statistics }),
    })
  }
}
