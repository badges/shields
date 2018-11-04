'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const { metric } = require('../../lib/text-formatters')
const { nonNegativeInteger } = require('../validators')
const {
  dockerBlue,
  buildDockerUrl,
  getDockerHubUser,
} = require('./docker-helpers')

const pullsSchema = Joi.object({
  pull_count: nonNegativeInteger,
}).required()

module.exports = class DockerPulls extends BaseJsonService {
  async fetch({ user, repo }) {
    return this._requestJson({
      schema: pullsSchema,
      url: `https://hub.docker.com/v2/repositories/${user}/${repo}`,
      errorMessages: { 404: 'repo not found' },
    })
  }

  static render({ count }) {
    return {
      message: metric(count),
      color: dockerBlue,
    }
  }

  async handle({ user, repo }) {
    const data = await this.fetch({
      user: getDockerHubUser(user),
      repo,
    })
    return this.constructor.render({ count: data.pull_count })
  }

  static get defaultBadgeData() {
    return { label: 'docker pulls' }
  }

  static get category() {
    return 'downloads'
  }

  static get url() {
    return buildDockerUrl('pulls')
  }

  static get examples() {
    return [
      {
        title: 'Docker Pulls',
        exampleUrl: '_/ubuntu',
        keywords: ['docker', 'pulls'],
        urlPattern: ':user/:repo',
        staticExample: this.render({ count: 765400000 }),
      },
    ]
  }
}
