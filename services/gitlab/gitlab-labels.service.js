import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { optionalUrl } from '../validators.js'
import GitLabBase from './gitlab-base.js'
import { description, httpErrorsFor } from './gitlab-helper.js'

const schema = Joi.object({
  color: Joi.string().replace('#', '').hex().required(),
}).required()

const queryParamSchema = Joi.object({
  gitlab_url: optionalUrl,
}).required()

export default class GitLabLabels extends GitLabBase {
  static category = 'issue-tracking'

  static route = {
    base: 'gitlab/labels',
    pattern: ':project+/:name',
    queryParamSchema,
  }

  static openApi = {
    '/gitlab/labels/{project}/{name}': {
      get: {
        summary: 'GitLab labels',
        description,
        parameters: [
          pathParam({
            name: 'project',
            example: 'gitlab-org/gitlab',
          }),
          pathParam({
            name: 'name',
            example: 'bug::ux',
          }),
          queryParam({
            name: 'gitlab_url',
            example: 'https://gitlab.com',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: ' ' }

  static render({ baseUrl, project, name, color }) {
    return {
      message: name,
      color,
      link: [
        `${baseUrl}/${project}`,
        encodeURI(`${baseUrl}/${project}/-/work-items?label_name[]=${name}`),
      ],
    }
  }

  async fetch({ project, baseUrl, name }) {
    return super.fetch({
      schema,
      url: `${baseUrl}/api/v4/projects/${encodeURIComponent(project)}/labels/${name}`,
      httpErrors: httpErrorsFor('project not found'),
    })
  }

  async handle({ project, name, gitlab_url: baseUrl = 'https://gitlab.com' }) {
    const { color } = await this.fetch({
      project,
      baseUrl,
      name,
    })
    return this.constructor.render({ baseUrl, project, name, color })
  }
}
