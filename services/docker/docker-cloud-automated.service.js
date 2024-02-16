import { BaseJsonService, pathParams } from '../index.js'
import { dockerBlue, buildDockerUrl } from './docker-helpers.js'
import { fetchBuild } from './docker-cloud-common-fetch.js'

export default class DockerCloudAutomatedBuild extends BaseJsonService {
  static category = 'build'
  static route = buildDockerUrl('cloud/automated')

  static auth = {
    userKey: 'dockerhub_username',
    passKey: 'dockerhub_pat',
    authorizedOrigins: ['https://hub.docker.com', 'https://cloud.docker.com'],
    isRequired: false,
  }

  static openApi = {
    '/docker/cloud/automated/{user}/{repo}': {
      get: {
        summary: 'Docker Cloud Automated build',
        parameters: pathParams(
          {
            name: 'user',
            example: 'jrottenberg',
          },
          {
            name: 'repo',
            example: 'ffmpeg',
          },
        ),
      },
    },
  }

  static _cacheLength = 14400

  static defaultBadgeData = { label: 'docker build' }

  static render({ buildSettings }) {
    if (buildSettings.length >= 1) {
      return { message: 'automated', color: dockerBlue }
    }
    return { message: 'manual', color: 'yellow' }
  }

  async handle({ user, repo }) {
    const data = await fetchBuild(this, { user, repo })

    if (data.objects.length === 0) {
      return this.constructor.render({
        buildSettings: [],
      })
    }
    return this.constructor.render({
      buildSettings: data.objects[0].build_settings,
    })
  }
}
