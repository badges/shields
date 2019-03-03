'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('..')
const { dockerBlue, buildDockerUrl } = require('./docker-helpers')

const cloudAutomatedBuildSchema = Joi.object({
  objects: Joi.array()
    .items(Joi.object({ build_settings: Joi.array() }).required())
    .required(),
}).required()

module.exports = class DockerCloudAutomatedBuild extends BaseJsonService {
  async fetch({ user, repo }) {
    return this._requestJson({
      schema: cloudAutomatedBuildSchema,
      url: `https://cloud.docker.com/api/build/v1/source/?image=${user}/${repo}`,
      errorMessages: { 404: 'repo not found' },
    })
  }

  static render({ buildSettings }) {
    if (buildSettings.length >= 1) {
      return { message: 'automated', color: dockerBlue }
    } else {
      return { message: 'manual', color: 'yellow' }
    }
  }

  async handle({ user, repo }) {
    const data = await this.fetch({ user, repo })
    return this.constructor.render({
      buildSettings: data.objects[0].build_settings,
    })
  }

  static get category() {
    return 'build'
  }

  static get route() {
    return buildDockerUrl('cloud/automated')
  }

  static get defaultBadgeData() {
    return { label: 'docker build' }
  }

  static get examples() {
    return [
      {
        title: 'Docker Automated build (new hub)',
        namedParams: {
          user: 'jrottenberg',
          repo: 'ffmpeg',
        },
        staticPreview: this.render({ buildSettings: ['test'] }),
      },
    ]
  }
}
