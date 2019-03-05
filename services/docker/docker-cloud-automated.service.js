'use strict'

const { BaseJsonService } = require('..')
const { dockerBlue, buildDockerUrl } = require('./docker-helpers')
const { fetchBuild } = require('./docker-cloud-common-fetch')

module.exports = class DockerCloudAutomatedBuild extends BaseJsonService {
  static render({ buildSettings }) {
    if (buildSettings.length >= 1) {
      return { message: 'automated', color: dockerBlue }
    }
    return { message: 'manual', color: 'yellow' }
  }

  async handle({ user, repo }) {
    const data = await fetchBuild(this, { user, repo })
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
        title: 'Docker Cloud Automated build',
        documentation:
          '<p>For the new Docker Hub (https://cloud.docker.com)</p>',
        namedParams: {
          user: 'jrottenberg',
          repo: 'ffmpeg',
        },
        staticPreview: this.render({ buildSettings: ['test'] }),
      },
    ]
  }
}
