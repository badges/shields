import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'
import {
  dockerBlue,
  buildDockerUrl,
  getDockerHubUser,
} from './docker-helpers.js'

const schema = Joi.object({
  star_count: nonNegativeInteger.required(),
}).required()

export default class DockerStars extends BaseJsonService {
  static category = 'rating'
  static route = buildDockerUrl('stars')
  static examples = [
    {
      title: 'Docker Stars',
      namedParams: {
        user: '_',
        repo: 'ubuntu',
      },
      staticPreview: this.render({ stars: 9000 }),
    },
  ]

  static _cacheLength = 7200

  static defaultBadgeData = { label: 'docker stars' }

  static render({ stars }) {
    return {
      message: metric(stars),
      color: dockerBlue,
    }
  }

  async fetch({ user, repo }) {
    return this._requestJson({
      schema,
      url: `https://hub.docker.com/v2/repositories/${getDockerHubUser(
        user
      )}/${repo}/`,
      httpErrors: { 404: 'repo not found' },
    })
  }

  async handle({ user, repo }) {
    const resp = await this.fetch({ user, repo })
    return this.constructor.render({ stars: resp.star_count })
  }
}
