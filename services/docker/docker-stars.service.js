'use strict'

const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { BaseService } = require('..')
const {
  dockerBlue,
  buildDockerUrl,
  getDockerHubUser,
} = require('./docker-helpers')

module.exports = class DockerStars extends BaseService {
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

  static defaultBadgeData = { label: 'docker stars' }

  static render({ stars }) {
    return {
      message: metric(stars),
      color: dockerBlue,
    }
  }

  async fetch({ user, repo }) {
    const url = `https://hub.docker.com/v2/repositories/${getDockerHubUser(
      user
    )}/${repo}/stars/count/`
    const { buffer } = await this._request({
      url,
      errorMessages: { 404: 'repo not found' },
    })
    return this.constructor._validate(buffer, nonNegativeInteger)
  }

  async handle({ user, repo }) {
    const stars = await this.fetch({ user, repo })
    return this.constructor.render({ stars })
  }
}
