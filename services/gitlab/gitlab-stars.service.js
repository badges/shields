import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { optionalUrl, nonNegativeInteger } from '../validators.js'
import { metric } from '../text-formatters.js'
import GitLabBase from './gitlab-base.js'
import { description } from './gitlab-helper.js'

const schema = Joi.object({
  star_count: nonNegativeInteger,
}).required()

const queryParamSchema = Joi.object({
  gitlab_url: optionalUrl,
}).required()

export default class GitlabStars extends GitLabBase {
  static category = 'social'

  static route = {
    base: 'gitlab/stars',
    pattern: ':project+',
    queryParamSchema,
  }

  static openApi = {
    '/gitlab/stars/{project}': {
      get: {
        summary: 'GitLab Stars',
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

  static defaultBadgeData = { label: 'stars', namedLogo: 'gitlab' }

  static render({ baseUrl, project, starCount }) {
    return {
      message: metric(starCount),
      style: 'social',
      color: 'blue',
      link: [`${baseUrl}/${project}`, `${baseUrl}/${project}/-/starrers`],
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
    const { star_count: starCount } = await this.fetch({
      project,
      baseUrl,
    })
    return this.constructor.render({ baseUrl, project, starCount })
  }
}
