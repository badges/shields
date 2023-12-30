import Joi from 'joi'
import { isBuildStatus, renderBuildStatusBadge } from '../build-status.js'
import { BaseJsonService, pathParam, queryParam } from '../index.js'

const schema = Joi.object({
  subject: Joi.string().required(),
  status: Joi.alternatives()
    .try(isBuildStatus, Joi.equal('unknown'))
    .required(),
}).required()
const queryParamSchema = Joi.object({
  task: Joi.string(),
  script: Joi.string(),
}).required()

export default class Cirrus extends BaseJsonService {
  static category = 'build'
  static route = {
    base: 'cirrus',
    pattern: 'github/:user/:repo/:branch*',
    queryParamSchema,
  }

  static openApi = {
    '/cirrus/github/{user}/{repo}': {
      get: {
        summary: 'Cirrus CI - Default Branch Build Status',
        parameters: [
          pathParam({ name: 'user', example: 'flutter' }),
          pathParam({ name: 'repo', example: 'flutter' }),
          queryParam({ name: 'task', example: 'build_docker' }),
          queryParam({ name: 'script', example: 'test' }),
        ],
      },
    },
    '/cirrus/github/{user}/{repo}/{branch}': {
      get: {
        summary: 'Cirrus CI - Specific Branch Build Status',
        parameters: [
          pathParam({ name: 'user', example: 'flutter' }),
          pathParam({ name: 'repo', example: 'flutter' }),
          pathParam({ name: 'branch', example: 'master' }),
          queryParam({ name: 'task', example: 'build_docker' }),
          queryParam({ name: 'script', example: 'test' }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'build' }

  static render({ subject, status }) {
    return renderBuildStatusBadge({ label: subject, status })
  }

  async handle({ user, repo, branch }, { script, task }) {
    const json = await this._requestJson({
      schema,
      url: `https://api.cirrus-ci.com/github/${user}/${repo}.json`,
      options: { searchParams: { branch, script, task } },
    })

    return this.constructor.render(json)
  }
}
