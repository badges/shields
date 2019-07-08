'use strict'

const Joi = require('@hapi/joi')
const {
  dockerBlue,
  buildDockerUrl,
  getDockerHubUser,
} = require('./docker-helpers')
const { BaseJsonService } = require('..')

const automatedBuildSchema = Joi.object({
  is_automated: Joi.boolean().required(),
}).required()

module.exports = class DockerAutomatedBuild extends BaseJsonService {
  static get category() {
    return 'build'
  }

  static get route() {
    return buildDockerUrl('automated')
  }

  static get examples() {
    return [
      {
        title: 'Docker Automated build',
        namedParams: {
          user: 'jrottenberg',
          repo: 'ffmpeg',
        },
        staticPreview: this.render({ isAutomated: true }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'docker build' }
  }

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
        user
      )}/${repo}`,
      errorMessages: { 404: 'repo not found' },
    })
  }

  async handle({ user, repo }) {
    const data = await this.fetch({ user, repo })
    return this.constructor.render({ isAutomated: data.is_automated })
  }
}
