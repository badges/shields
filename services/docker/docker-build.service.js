'use strict'

const Joi = require('joi')
const { anyInteger } = require('../validators')
const { BaseJsonService } = require('..')
const {
  dockerBlue,
  buildDockerUrl,
  getDockerHubUser,
} = require('./docker-helpers')

const buildSchema = Joi.object({
  results: Joi.array()
    .items(Joi.object({ status: anyInteger }).required())
    .required(),
}).required()

module.exports = class DockerBuild extends BaseJsonService {
  static category = 'build'
  static route = buildDockerUrl('build')
  static examples = [
    {
      title: 'Docker Build Status',
      namedParams: {
        user: 'jrottenberg',
        repo: 'ffmpeg',
      },
      staticPreview: this.render({ status: 10 }),
    },
  ]

  static defaultBadgeData = { label: 'docker build' }

  static render({ status }) {
    if (status === 10) {
      return { message: 'passing', color: 'brightgreen' }
    } else if (status < 0) {
      return { message: 'failing', color: 'red' }
    }
    return { message: 'building', color: dockerBlue }
  }

  async fetch({ user, repo }) {
    return this._requestJson({
      schema: buildSchema,
      url: `https://registry.hub.docker.com/v2/repositories/${getDockerHubUser(
        user
      )}/${repo}/buildhistory`,
      errorMessages: { 404: 'repo not found' },
    })
  }

  async handle({ user, repo }) {
    const data = await this.fetch({ user, repo })
    return this.constructor.render({ status: data.results[0].status })
  }
}
