import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { optionalUrl } from '../validators.js'
import { renderLicenseBadge } from '../licenses.js'
import { description, httpErrorsFor } from './gitlab-helper.js'
import GitLabBase from './gitlab-base.js'

const schema = Joi.object({
  license: Joi.object({
    name: Joi.string().required(),
  }).allow(null),
}).required()

const queryParamSchema = Joi.object({
  gitlab_url: optionalUrl,
}).required()

export default class GitlabLicense extends GitLabBase {
  static category = 'license'

  static route = {
    base: 'gitlab/license',
    pattern: ':project+',
    queryParamSchema,
  }

  static openApi = {
    '/gitlab/license/{project}': {
      get: {
        summary: 'GitLab License',
        description,
        parameters: [
          pathParam({
            name: 'project',
            example: 'gitlab-org/gitlab',
          }),
          queryParam({
            name: 'gitlab_url',
            example: 'https://gitlab.com',
          }),
        ],
      },
    },
  }

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
      httpErrors: httpErrorsFor('project not found'),
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
