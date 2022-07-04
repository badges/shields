import Joi from 'joi'
import { optionalUrl } from '../validators.js'
import { renderLicenseBadge } from '../licenses.js'
import GitLabBase from './gitlab-base.js'

const schema = Joi.object({
  license: Joi.object({
    name: Joi.string().required(),
  }).allow(null),
}).required()

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
  Note that only internet-accessible GitLab instances are supported, for example https://jihulab.com, https://gitlab.gnome.org, or https://gitlab.com/.
  You may use your GitLab Project Id (e.g. 13953) or your Project Path (e.g. gitlab-cn/gitlab ) in <a href="https://jihulab.com">https://jihulab.com</a>
</p>
`

export default class GitlabLicense extends GitLabBase {
  static category = 'license'

  static route = {
    base: 'gitlab/license',
    pattern: ':project+',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitLab',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      staticPreview: {
        label: 'license',
        message: 'MIT License',
        color: 'green',
      },
      documentation,
    },
    {
      title: 'GitLab (self-managed)',
      namedParams: {
        project: 'gitlab-cn/gitlab',
      },
      queryParams: { gitlab_url: 'https://jihulab.com' },
      staticPreview: {
        label: 'license',
        message: 'MIT License',
        color: 'green',
      },
      documentation: customDocumentation,
    },
  ]

  static defaultBadgeData = { label: 'license' }

  static render({ license }) {
    if (license) {
      return renderLicenseBadge({ license })
    } else {
      return { message: 'not specified' }
    }
  }

  async fetch({ project, baseUrl }) {
    // https://docs.gitlab.com/ee/api/projects.html#get-single-project
    return super.fetch({
      schema,
      url: `${baseUrl}/api/v4/projects/${encodeURIComponent(project)}`,
      options: { searchParams: { license: '1' } },
      errorMessages: {
        404: 'repo not found',
      },
    })
  }

  async handle({ project }, { gitlab_url: baseUrl = 'https://gitlab.com' }) {
    const { license: licenseObject } = await this.fetch({
      project,
      baseUrl,
    })
    const license = licenseObject ? licenseObject.name : undefined
    return this.constructor.render({ license })
  }
}
