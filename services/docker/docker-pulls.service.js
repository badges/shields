import Joi from 'joi'
import { renderDownloadsBadge } from '../downloads.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'
import {
  dockerBlue,
  buildDockerUrl,
  getDockerHubUser,
} from './docker-helpers.js'

const pullsSchema = Joi.object({
  pull_count: nonNegativeInteger,
}).required()

export default class DockerPulls extends BaseJsonService {
  static category = 'downloads'
  static route = buildDockerUrl('pulls')
  static examples = [
    {
      title: 'Docker Pulls',
      namedParams: {
        user: '_',
        repo: 'ubuntu',
      },
      staticPreview: this.render({ count: 765400000 }),
    },
  ]

  static defaultBadgeData = { label: 'docker pulls' }

  static render({ count: downloads }) {
    return renderDownloadsBadge({ downloads, colorOverride: dockerBlue })
  }

  async fetch({ user, repo }) {
    return this._requestJson({
      schema: pullsSchema,
      url: `https://hub.docker.com/v2/repositories/${getDockerHubUser(
        user
      )}/${repo}`,
      errorMessages: { 404: 'repo not found' },
    })
  }

  async handle({ user, repo }) {
    const data = await this.fetch({ user, repo })
    return this.constructor.render({ count: data.pull_count })
  }
}
