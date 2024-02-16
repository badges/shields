import { BaseJsonService, NotFound, pathParams } from '../index.js'
import { dockerBlue, buildDockerUrl } from './docker-helpers.js'
import { fetchBuild } from './docker-cloud-common-fetch.js'

export default class DockerCloudBuild extends BaseJsonService {
  static category = 'build'
  static route = buildDockerUrl('cloud/build')

  static auth = {
    userKey: 'dockerhub_username',
    passKey: 'dockerhub_pat',
    authorizedOrigins: ['https://hub.docker.com', 'https://cloud.docker.com'],
    isRequired: false,
  }

  static openApi = {
    '/docker/cloud/build/{user}/{repo}': {
      get: {
        summary: 'Docker Cloud Build Status',
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

  static defaultBadgeData = { label: 'docker build' }

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

    if (data.objects.length === 0) {
      throw new NotFound({
        prettyMessage: 'automated builds not set up',
      })
    }
    return this.constructor.render({ state: data.objects[0].state })
  }
}
