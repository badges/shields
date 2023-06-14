import Joi from 'joi'
import { optionalUrl, nonNegativeInteger } from '../validators.js'
import { renderContributorBadge } from '../contributor-count.js'
import { documentation, httpErrorsFor } from './gitlab-helper.js'
import GitLabBase from './gitlab-base.js'

const schema = Joi.object({ 'x-total': nonNegativeInteger }).required()

const queryParamSchema = Joi.object({
  gitlab_url: optionalUrl,
}).required()

export default class GitlabContributors extends GitLabBase {
  static category = 'activity'
  static route = {
    base: 'gitlab/contributors',
    pattern: ':project+',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitLab contributors',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      staticPreview: this.render({ contributorCount: 418 }),
      documentation,
    },
    {
      title: 'GitLab (self-managed) contributors',
      queryParams: { gitlab_url: 'https://jihulab.com' },
      namedParams: {
        project: 'gitlab-cn/gitlab',
      },
      staticPreview: this.render({ contributorCount: 415 }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'contributors' }

  static render({ contributorCount }) {
    return renderContributorBadge({ contributorCount })
  }

  async handle({ project }, { gitlab_url: baseUrl = 'https://gitlab.com' }) {
    // https://docs.gitlab.com/ee/api/repositories.html#contributors
    const { res } = await this._request(
      this.authHelper.withBearerAuthHeader({
        url: `${baseUrl}/api/v4/projects/${encodeURIComponent(
          project
        )}/repository/contributors`,
        options: { searchParams: { page: '1', per_page: '1' } },
        httpErrors: httpErrorsFor('project not found'),
      })
    )
    const data = this.constructor._validate(res.headers, schema)
    // The total number of contributors is in the `x-total` field in the headers.
    // https://docs.gitlab.com/ee/api/index.html#other-pagination-headers
    const contributorCount = data['x-total']
    return this.constructor.render({ contributorCount })
  }
}
