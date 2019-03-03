'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('..')
const { dockerBlue, buildDockerUrl } = require('./docker-helpers')

const cloudBuildSchema = Joi.object({
  objects: Joi.array()
    .items(Joi.object({ state: Joi.string() }).required())
    .required(),
}).required()

module.exports = class DockerCloudBuild extends BaseJsonService {
  async fetch({ user, repo }) {
    return this._requestJson({
      schema: cloudBuildSchema,
      url: `https://cloud.docker.com/api/build/v1/source/?image=${user}/${repo}`,
      errorMessages: { 404: 'repo not found' },
    })
  }

  static render({ state }) {
    if (state === 'Success') {
      return { message: 'passing', color: 'brightgreen' }
    }
    if (state === 'Failed') {
      return { message: 'failing', color: 'red' }
    }
    return { message: 'building', color: dockerBlue }
  }

  async handle({ user, repo }) {
    const data = await this.fetch({ user, repo })
    return this.constructor.render({ state: data.objects[0].state })
  }

  static get category() {
    return 'build'
  }

  static get route() {
    return buildDockerUrl('cloud/build')
  }

  static get defaultBadgeData() {
    return { label: 'docker build' }
  }

  static get examples() {
    return [
      {
        title: 'Docker Build Status (new hub)',
        namedParams: {
          user: 'jrottenberg',
          repo: 'ffmpeg',
        },
        staticPreview: this.render({ state: 'Success' }),
      },
    ]
  }
}
