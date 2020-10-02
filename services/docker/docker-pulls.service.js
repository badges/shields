'use strict'

const Joi = require('joi')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService } = require('..')
const {
  dockerBlue,
  buildDockerUrl,
  getDockerHubUser,
} = require('./docker-helpers')

const pullsSchema = Joi.object({
  pull_count: nonNegativeInteger,
}).required()

module.exports = class DockerPulls extends BaseJsonService {
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

  static render({ count }) {
    return {
      message: metric(count),
      color: dockerBlue,
    }
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
