import { BaseJsonService, NotFound } from '../index.js'
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

  static examples = [
    {
      title: 'Docker Cloud Build Status',
      documentation: '<p>For the new Docker Hub (https://cloud.docker.com)</p>',
      namedParams: {
        user: 'jrottenberg',
        repo: 'ffmpeg',
      },
      staticPreview: this.render({ state: 'Success' }),
    },
  ]

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
