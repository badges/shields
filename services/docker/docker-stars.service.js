import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, pathParams } from '../index.js'
import {
  dockerBlue,
  buildDockerUrl,
  getDockerHubUser,
} from './docker-helpers.js'
import { fetch } from './docker-hub-common-fetch.js'

const schema = Joi.object({
  star_count: nonNegativeInteger.required(),
}).required()

export default class DockerStars extends BaseJsonService {
  static category = 'rating'
  static route = buildDockerUrl('stars')

  static auth = {
    userKey: 'dockerhub_username',
    passKey: 'dockerhub_pat',
    authorizedOrigins: ['https://hub.docker.com'],
    isRequired: false,
  }

  static openApi = {
    '/docker/stars/{user}/{repo}': {
      get: {
        summary: 'Docker Stars',
        parameters: pathParams(
          {
            name: 'user',
            example: '_',
          },
          {
            name: 'repo',
            example: 'ubuntu',
          },
        ),
      },
    },
  }

  static _cacheLength = 14400

  static defaultBadgeData = { label: 'docker stars' }

  static render({ stars }) {
    return {
      message: metric(stars),
      color: dockerBlue,
    }
  }

  async fetch({ user, repo }) {
    return await fetch(this, {
      schema,
      url: `https://hub.docker.com/v2/repositories/${getDockerHubUser(
        user,
      )}/${repo}/`,
      httpErrors: { 404: 'repo not found' },
    })
  }

  async handle({ user, repo }) {
    const resp = await this.fetch({ user, repo })
    return this.constructor.render({ stars: resp.star_count })
  }
}
