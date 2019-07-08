'use strict'

const { dockerBlue, buildDockerUrl } = require('./docker-helpers')
const { fetchBuild } = require('./docker-cloud-common-fetch')
const { BaseJsonService } = require('..')

module.exports = class DockerCloudBuild extends BaseJsonService {
  static get category() {
    return 'build'
  }

  static get route() {
    return buildDockerUrl('cloud/build')
  }

  static get examples() {
    return [
      {
        title: 'Docker Cloud Build Status',
        documentation:
          '<p>For the new Docker Hub (https://cloud.docker.com)</p>',
        namedParams: {
          user: 'jrottenberg',
          repo: 'ffmpeg',
        },
        staticPreview: this.render({ state: 'Success' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'docker build' }
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
    const data = await fetchBuild(this, { user, repo })
    return this.constructor.render({ state: data.objects[0].state })
  }
}
