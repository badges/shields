import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { optionalUrl, nonNegativeInteger } from '../validators.js'
import { metric } from '../text-formatters.js'
import GitLabBase from './gitlab-base.js'
import { description } from './gitlab-helper.js'

const schema = Joi.object({
  forks_count: nonNegativeInteger,
}).required()

const queryParamSchema = Joi.object({
  gitlab_url: optionalUrl,
}).required()

export default class GitlabForks extends GitLabBase {
  static category = 'social'

  static route = {
    base: 'gitlab/forks',
    pattern: ':project+',
    queryParamSchema,
  }

  static openApi = {
    '/gitlab/forks/{project}': {
      get: {
        summary: 'GitLab Forks',
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

  static defaultBadgeData = { label: 'forks', namedLogo: 'gitlab' }

  static render({ baseUrl, project, forkCount }) {
    return {
      message: metric(forkCount),
      style: 'social',
      color: 'blue',
      link: [
        `${baseUrl}/${project}/-/forks/new`,
        `${baseUrl}/${project}/-/forks`,
      ],
    }
  }

  async fetch({ project, baseUrl }) {
    // https://docs.gitlab.com/ee/api/projects.html#get-single-project
    return super.fetch({
      schema,
      url: `${baseUrl}/api/v4/projects/${encodeURIComponent(project)}`,
      httpErrors: {
        404: 'project not found',
      },
    })
  }

  async handle({ project }, { gitlab_url: baseUrl = 'https://gitlab.com' }) {
    const { forks_count: forkCount } = await this.fetch({
      project,
      baseUrl,
    })
    return this.constructor.render({ baseUrl, project, forkCount })
  }
}
