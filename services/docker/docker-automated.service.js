import Joi from 'joi'
import { BaseJsonService, pathParams } from '../index.js'
import {
  dockerBlue,
  buildDockerUrl,
  getDockerHubUser,
} from './docker-helpers.js'

const automatedBuildSchema = Joi.object({
  is_automated: Joi.boolean().required(),
}).required()

export default class DockerAutomatedBuild extends BaseJsonService {
  static category = 'build'
  static route = buildDockerUrl('automated')
  static openApi = {
    '/docker/automated/{user}/{repo}': {
      get: {
        summary: 'Docker Automated build',
        parameters: pathParams(
          {
            name: 'user',
            example: 'jrottenberg',
          },
          {
            name: 'repo',
            example: 'ffmpeg',
          },
        ),
      },
    },
  }

  static _cacheLength = 14400

  static defaultBadgeData = { label: 'docker build' }

  static render({ isAutomated }) {
    if (isAutomated) {
      return { message: 'automated', color: dockerBlue }
    } else {
      return { message: 'manual', color: 'yellow' }
    }
  }

  async fetch({ user, repo }) {
    return this._requestJson({
      schema: automatedBuildSchema,
      url: `https://registry.hub.docker.com/v2/repositories/${getDockerHubUser(
        user,
      )}/${repo}`,
      httpErrors: { 404: 'repo not found' },
    })
  }

  async handle({ user, repo }) {
    const data = await this.fetch({ user, repo })
    return this.constructor.render({ isAutomated: data.is_automated })
  }
}
