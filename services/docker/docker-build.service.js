'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const { anyInteger } = require('../validators')
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
  async fetch({ user, repo }) {
    return this._requestJson({
      schema: buildSchema,
      url: `https://registry.hub.docker.com/v2/repositories/${getDockerHubUser(
        user
      )}/${repo}/buildhistory`,
      errorMessages: { 404: 'repo not found' },
    })
  }

  static render({ status }) {
    if (status === 10) {
      return { message: 'passing', color: 'brightgreen' }
    } else if (status < 0) {
      return { message: 'failing', color: 'red' }
    }
    return { message: 'building', color: dockerBlue }
  }

  async handle({ user, repo }) {
    const data = await this.fetch({ user, repo })
    return this.constructor.render({ status: data.results[0].status })
  }

  static get category() {
    return 'build'
  }

  static get route() {
    return buildDockerUrl('build')
  }

  static get defaultBadgeData() {
    return { label: 'docker build' }
  }

  static get examples() {
    return [
      {
        title: 'Docker Build Status',
        exampleUrl: 'jrottenberg/ffmpeg',
        pattern: ':user/:repo',
        keywords: ['docker', 'build', 'status'],
        staticExample: this.render({ status: 10 }),
      },
    ]
  }
}
