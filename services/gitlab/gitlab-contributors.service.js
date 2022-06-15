import Joi from 'joi'
import parseLinkHeader from 'parse-link-header'
import { optionalUrl } from '../validators.js'
import { renderContributorBadge } from '../contributor-count.js'
import GitLabBase from './gitlab-base.js'

// check response type
const schema = Joi.array().items(Joi.object())

const queryParamSchema = Joi.object({
  gitlab_url: optionalUrl,
}).required()

const documentation = `
<p>
  You may use your GitLab Project Id (e.g. 278964) or your Project Path (e.g. gitlab-org/gitlab )
</p>
`

const customDocumentation = `
<p>
  Note that only network-accessible jihulab.com and other self-hosted GitLab instances are supported.
  You may use your GitLab Project Id (e.g. 13953) or your Project Path (e.g. gitlab-cn/gitlab ) in <a href="https://jihulab.com">https://jihulab.com</a>
</p>
`

export default class GitlabContributors extends GitLabBase {
  static category = 'activity'
  static route = {
    base: 'gitlab/v/contributor',
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
      title: 'GitLab (custom server) contributors',
      queryParams: { gitlab_url: 'https://jihulab.com' },
      namedParams: {
        project: 'gitlab-cn/gitlab',
      },
      staticPreview: this.render({ contributorCount: 415 }),
      documentation: customDocumentation,
    },
  ]

  static defaultBadgeData = { label: 'contributors' }

  static render({ contributorCount }) {
    return renderContributorBadge({ contributorCount })
  }

  async handle({ project }, { gitlab_url: baseUrl = 'https://gitlab.com' }) {
    // https://docs.gitlab.com/ee/api/repositories.html#contributors
    const { res, buffer } = await this._request({
      url: `${baseUrl}/api/v4/projects/${encodeURIComponent(
        project
      )}/repository/contributors`,
      options: { searchParams: { page: '1', per_page: '1' } },
      errorMessages: {
        404: 'project not found',
      },
    })
    const parsed = parseLinkHeader(res.headers.link)
    let contributorCount
    if (parsed === null) {
      const json = this._parseJson(buffer)
      this.constructor._validate(json, schema)
      // The total number of contributors is in the `x-total` field in the headers.
      // https://docs.gitlab.com/ee/api/index.html#other-pagination-headers
      contributorCount = res.headers['x-total']
    } else {
      contributorCount = +parsed.last.page
    }

    return this.constructor.render({ contributorCount })
  }
}
