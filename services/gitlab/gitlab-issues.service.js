import Joi from 'joi'
import { optionalUrl, nonNegativeInteger } from '../validators.js'
import { metric } from '../text-formatters.js'
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

const documentation = `
<p>
  You may use your GitLab Project Id (e.g. 278964) or your Project Path (e.g. gitlab-org/gitlab ).
  Note that only internet-accessible GitLab instances are supported, for example https://jihulab.com, https://gitlab.gnome.org, or https://gitlab.com/.
</p>
`

const labelDocumentation = `
<p>
  If you want to use multiple labels then please use commas (<code>,</code>) to separate them, e.g. <code>foo,bar</code>.
</p>
`

export default class GitlabIssues extends GitLabBase {
  static category = 'issue-tracking'

  static route = {
    base: 'gitlab/issues',
    pattern: ':variant(all|open|closed):raw(-raw)?/:project+',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitLab issues',
      pattern: 'open/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: { gitlab_url: 'https://gitlab.com' },
      staticPreview: {
        label: 'issues',
        message: '44k open',
        color: 'yellow',
      },
      documentation,
    },
    {
      title: 'GitLab issues',
      pattern: 'open-raw/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: { gitlab_url: 'https://gitlab.com' },
      staticPreview: {
        label: 'open issues',
        message: '44k',
        color: 'yellow',
      },
      documentation,
    },
    {
      title: 'GitLab issues by-label',
      pattern: 'open/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: {
        labels: 'test,failure::new',
        gitlab_url: 'https://gitlab.com',
      },
      staticPreview: {
        label: 'test,failure::new issues',
        message: '16 open',
        color: 'yellow',
      },
      documentation: documentation + labelDocumentation,
    },
    {
      title: 'GitLab issues by-label',
      pattern: 'open-raw/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: {
        labels: 'test,failure::new',
        gitlab_url: 'https://gitlab.com',
      },
      staticPreview: {
        label: 'open test,failure::new issues',
        message: '16',
        color: 'yellow',
      },
      documentation: documentation + labelDocumentation,
    },
    {
      title: 'GitLab closed issues',
      pattern: 'closed/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: { gitlab_url: 'https://gitlab.com' },
      staticPreview: {
        label: 'issues',
        message: '72k closed',
        color: 'yellow',
      },
      documentation,
    },
    {
      title: 'GitLab closed issues',
      pattern: 'closed-raw/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: { gitlab_url: 'https://gitlab.com' },
      staticPreview: {
        label: 'closed issues',
        message: '72k ',
        color: 'yellow',
      },
      documentation,
    },
    {
      title: 'GitLab closed issues by-label',
      pattern: 'closed/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: {
        labels: 'test,failure::new',
        gitlab_url: 'https://gitlab.com',
      },
      staticPreview: {
        label: 'test,failure::new issues',
        message: '4 closed',
        color: 'yellow',
      },
      documentation: documentation + labelDocumentation,
    },
    {
      title: 'GitLab closed issues by-label',
      pattern: 'closed-raw/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: {
        labels: 'test,failure::new',
        gitlab_url: 'https://gitlab.com',
      },
      staticPreview: {
        label: 'closed test,failure::new issues',
        message: '4',
        color: 'yellow',
      },
      documentation: documentation + labelDocumentation,
    },
    {
      title: 'GitLab all issues',
      pattern: 'all/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: { gitlab_url: 'https://gitlab.com' },
      staticPreview: {
        label: 'issues',
        message: '115k all',
        color: 'yellow',
      },
      documentation,
    },
    {
      title: 'GitLab all issues',
      pattern: 'all-raw/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: { gitlab_url: 'https://gitlab.com' },
      staticPreview: {
        label: 'all issues',
        message: '115k',
        color: 'yellow',
      },
      documentation,
    },
    {
      title: 'GitLab all issues by-label',
      pattern: 'all-raw/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: {
        labels: 'test,failure::new',
        gitlab_url: 'https://gitlab.com',
      },
      staticPreview: {
        label: 'all test,failure::new issues',
        message: '20',
        color: 'yellow',
      },
      documentation: documentation + labelDocumentation,
    },
  ]

  static defaultBadgeData = { label: 'issues', color: 'informational' }

  static render({ variant, raw, labels, issueCount }) {
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
        project
      )}/issues_statistics`,
      options: labels ? { searchParams: { labels } } : undefined,
      errorMessages: {
        404: 'project not found',
      },
    })
  }

  static transform({ variant, statistics }) {
    const state = variant
    let issueCount
    switch (state) {
      case 'open':
        issueCount = statistics.counts.opened
        break
      case 'closed':
        issueCount = statistics.counts.closed
        break
      case 'all':
        issueCount = statistics.counts.all
        break
    }

    return issueCount
  }

  async handle(
    { variant, raw, project },
    { gitlab_url: baseUrl = 'https://gitlab.com', labels }
  ) {
    const { statistics } = await this.fetch({
      project,
      baseUrl,
      labels,
    })
    return this.constructor.render({
      variant,
      raw,
      labels,
      issueCount: this.constructor.transform({ variant, statistics }),
    })
  }
}
