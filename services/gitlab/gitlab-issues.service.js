import Joi from 'joi'
import { optionalUrl } from '../validators.js'
import { metric } from '../text-formatters.js'
import GitLabBase from './gitlab-base.js'

const schema = Joi.object({
  statistics: Joi.object({
    counts: Joi.object({
      all: Joi.number().required(),
      closed: Joi.number().required(),
      opened: Joi.number().required(),
    }).required(),
  }).allow(null),
}).required()

const queryParamSchema = Joi.object({
  labels: Joi.string(),
  gitlab_url: optionalUrl,
}).required()

const documentation = `
<p>
  You may use your GitLab Project Id (e.g. 278964) or your Project Path (e.g. gitlab-org/gitlab )
</p>
`

const customDocumentation = `
<p>
  Note that only internet-accessible GitLab instances are supported, for example https://jihulab.com, https://gitlab.gnome.org, or https://gitlab.com/.
  You may use your GitLab Project Id (e.g. 13953) or your Project Path (e.g. gitlab-cn/gitlab ) in <a href="https://jihulab.com">https://jihulab.com</a>
</p>
`

const labelDocumentation = `
<p>
  Support Multi-label and <a href="https://docs.gitlab.com/ee/user/project/labels.html#scoped-labels">Scoped labels</a>, Multi-lable please use <code>,</code> to separate.
</p>
`

export default class GitlabIssues extends GitLabBase {
  static category = 'issue-tracking'

  static route = {
    base: 'gitlab/v/issues',
    pattern: ':variant(all|opened|closed):raw(-raw)?/:project+',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitLab issue',
      pattern: 'opened/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      staticPreview: {
        label: 'issues',
        message: '44k open',
        color: 'yellow',
      },
      documentation,
    },
    {
      title: 'GitLab issue',
      pattern: 'opened-raw/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      staticPreview: {
        label: 'open issues',
        message: '44k',
        color: 'yellow',
      },
      documentation,
    },
    {
      title: 'GitLab issues by-label',
      pattern: 'opened/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: {
        labels: 'test,failure::new',
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
      pattern: 'opened-raw/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: {
        labels: 'test,failure::new',
      },
      staticPreview: {
        label: 'open test,failure::new issues',
        message: '16',
        color: 'yellow',
      },
      documentation: documentation + labelDocumentation,
    },
    {
      title: 'GitLab closed issue',
      pattern: 'closed/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      staticPreview: {
        label: 'issues',
        message: '72k closed',
        color: 'yellow',
      },
      documentation,
    },
    {
      title: 'GitLab closed issue',
      pattern: 'closed-raw/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
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
      },
      staticPreview: {
        label: 'closed test,failure::new issues',
        message: '4',
        color: 'yellow',
      },
      documentation: documentation + labelDocumentation,
    },
    {
      title: 'GitLab all issue',
      pattern: 'all/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      staticPreview: {
        label: 'issues',
        message: '115k all',
        color: 'yellow',
      },
      documentation,
    },
    {
      title: 'GitLab all issue',
      pattern: 'all-raw/:project+',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
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
      },
      staticPreview: {
        label: 'all test,failure::new issues',
        message: '20',
        color: 'yellow',
      },
      documentation: documentation + labelDocumentation,
    },

    {
      title: 'GitLab (self-managed) issue',
      pattern: 'opened/:project+',
      namedParams: {
        project: 'gitlab-cn/gitlab',
      },
      queryParams: { gitlab_url: 'https://jihulab.com' },
      staticPreview: {
        label: 'issues',
        message: '358 open',
        color: 'yellow',
      },
      documentation: customDocumentation,
    },
    {
      title: 'GitLab (self-managed) issue',
      pattern: 'opened-raw/:project+',
      namedParams: {
        project: 'gitlab-cn/gitlab',
      },
      queryParams: { gitlab_url: 'https://jihulab.com' },
      staticPreview: {
        label: 'open issues',
        message: '358',
        color: 'yellow',
      },
      documentation: customDocumentation,
    },
    {
      title: 'GitLab (self-managed) issues by-label',
      pattern: 'opened/:project+',
      namedParams: {
        project: 'gitlab-cn/gitlab',
      },
      queryParams: {
        gitlab_url: 'https://jihulab.com',
        labels: 'backend,feature::enhancement',
      },
      staticPreview: {
        label: 'backend,feature::enhancement issues',
        message: '27 open',
        color: 'yellow',
      },
      documentation: customDocumentation + labelDocumentation,
    },
    {
      title: 'GitLab (self-managed) issues by-label',
      pattern: 'opened-raw/:project+',
      namedParams: {
        project: 'gitlab-cn/gitlab',
      },
      queryParams: {
        gitlab_url: 'https://jihulab.com',
        labels: 'backend,feature::enhancement',
      },
      staticPreview: {
        label: 'open backend,feature::enhancement issues',
        message: '27',
        color: 'yellow',
      },
      documentation: customDocumentation + labelDocumentation,
    },
    {
      title: 'GitLab (self-managed) closed issue',
      pattern: 'closed/:project+',
      namedParams: {
        project: 'gitlab-cn/gitlab',
      },
      queryParams: { gitlab_url: 'https://jihulab.com' },
      staticPreview: {
        label: 'issues',
        message: '611 closed',
        color: 'yellow',
      },
      documentation: customDocumentation,
    },
    {
      title: 'GitLab (self-managed) closed issue',
      pattern: 'closed-raw/:project+',
      namedParams: {
        project: 'gitlab-cn/gitlab',
      },
      queryParams: { gitlab_url: 'https://jihulab.com' },
      staticPreview: {
        label: 'closed issues',
        message: '611',
        color: 'yellow',
      },
      documentation: customDocumentation,
    },
    {
      title: 'GitLab (self-managed) closed issues by-label',
      pattern: 'closed/:project+',
      namedParams: {
        project: 'gitlab-cn/gitlab',
      },
      queryParams: {
        gitlab_url: 'https://jihulab.com',
        labels: 'backend,feature::enhancement',
      },
      staticPreview: {
        label: 'backend,feature::enhancement issues',
        message: '57 closed',
        color: 'yellow',
      },
      documentation: customDocumentation + labelDocumentation,
    },
    {
      title: 'GitLab (self-managed) closed issues by-label',
      pattern: 'closed-raw/:project+',
      namedParams: {
        project: 'gitlab-cn/gitlab',
      },
      queryParams: {
        gitlab_url: 'https://jihulab.com',
        labels: 'backend,feature::enhancement',
      },
      staticPreview: {
        label: 'closed backend,feature::enhancement issues',
        message: '57',
        color: 'yellow',
      },
      documentation: customDocumentation + labelDocumentation,
    },
    {
      title: 'GitLab (self-managed) all issue',
      pattern: 'all/:project+',
      namedParams: {
        project: 'gitlab-cn/gitlab',
      },
      queryParams: { gitlab_url: 'https://jihulab.com' },
      staticPreview: {
        label: 'issues',
        message: '969 all',
        color: 'yellow',
      },
      documentation: customDocumentation,
    },
    {
      title: 'GitLab (self-managed) all issue',
      pattern: 'all-raw/:project+',
      namedParams: {
        project: 'gitlab-cn/gitlab',
      },
      queryParams: { gitlab_url: 'https://jihulab.com' },
      staticPreview: {
        label: 'all issues',
        message: '969',
        color: 'yellow',
      },
      documentation: customDocumentation,
    },
    {
      title: 'GitLab (self-managed) all issues by-label',
      pattern: 'all-raw/:project+',
      namedParams: {
        project: 'gitlab-cn/gitlab',
      },
      queryParams: {
        gitlab_url: 'https://jihulab.com',
        labels: 'backend,feature::enhancement',
      },
      staticPreview: {
        label: 'all backend,feature::enhancement issues',
        message: '84',
        color: 'yellow',
      },
      documentation: customDocumentation + labelDocumentation,
    },
  ]

  static defaultBadgeData = { label: 'issues', color: 'informational' }

  static render({ variant, raw, statistics, labels }) {
    let state = variant
    if (state === 'opened') {
      state = 'open'
    }
    const isMultiLabel = labels && labels.includes(',')
    const labelText = labels ? `${isMultiLabel ? `${labels}` : labels} ` : ''

    let labelPrefix = ''
    let messageSuffix = ''
    if (raw !== undefined) {
      labelPrefix = `${state} `
    } else {
      messageSuffix = state
    }

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
    const renderLabel = `${labelPrefix}${labelText}issues`

    return {
      label: renderLabel,
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

  async handle(
    { variant, raw, project },
    { gitlab_url: baseUrl = 'https://gitlab.com', labels }
  ) {
    const { statistics } = await this.fetch({
      project,
      baseUrl,
      labels,
    })
    return this.constructor.render({ variant, raw, statistics, labels })
  }
}
