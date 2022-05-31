import Joi from 'joi'
import { renderLicenseBadge } from '../licenses.js'
import GitLabBase from './gitlab-base.js'

const schema = Joi.object({
  license: Joi.object({
    name: Joi.string().required(),
  }).allow(null),
}).required()

const documentation = `
<p>
  You may use your GitLab Project Id (e.g. 13083) or your Project Path (e.g. gitlab-org/gitlab-foss )
</p>
`
const commonProps = {
  namedParams: {
    project: 'gitlab-org/gitlab-foss',
  },
  documentation,
}

export default class GitlabLicense extends GitLabBase {
  static category = 'license'

  static route = {
    base: 'gitlab/v/license',
    pattern: ':project+',
  }

  static examples = [
    {
      title: 'GitLab',
      ...commonProps,
      staticPreview: {
        label: 'license',
        message: 'MIT',
        color: 'green',
      },
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
