'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const {
  dockerBlue,
  buildDockerUrl,
  getDockerHubUser,
} = require('./docker-helpers')

const automatedBuildSchema = Joi.object({
  is_automated: Joi.boolean().required(),
}).required()

module.exports = class DockerAutomatedBuild extends BaseJsonService {
  async fetch({ user, repo }) {
    return this._requestJson({
      schema: automatedBuildSchema,
      url: `https://registry.hub.docker.com/v2/repositories/${getDockerHubUser(
        user
      )}/${repo}`,
      errorMessages: { 404: 'repo not found' },
    })
  }

  static render({ isAutomated }) {
    if (isAutomated) {
      return { message: 'automated', color: dockerBlue }
    } else {
      return { message: 'manual', color: 'yellow' }
    }
  }

  async handle({ user, repo }) {
    const data = await this.fetch({ user, repo })
    return this.constructor.render({ isAutomated: data.is_automated })
  }

  static get category() {
    return 'build'
  }

  static get route() {
    return buildDockerUrl('automated')
  }

  static get defaultBadgeData() {
    return { label: 'docker build' }
  }

  static get examples() {
    return [
      {
        title: 'Docker Automated build',
        exampleUrl: 'jrottenberg/ffmpeg',
        pattern: ':user/:repo',
        keywords: ['docker', 'automated', 'build'],
        staticExample: this.render({ isAutomated: true }),
      },
    ]
  }
}
