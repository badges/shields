import { pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { BaseModrinthService, description } from './modrinth-base.js'

export default class ModrinthFollowers extends BaseModrinthService {
  static category = 'social'

  static route = {
    base: 'modrinth/followers',
    pattern: ':projectId',
  }

  static openApi = {
    '/modrinth/followers/{projectId}': {
      get: {
        summary: 'Modrinth Followers',
        description,
        parameters: pathParams({
          name: 'projectId',
          example: 'AANobbMI',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'followers', namedLogo: 'modrinth' }

  static render({ followers }) {
    return {
      message: metric(followers),
      style: 'social',
      color: 'blue',
    }
  }

  async handle({ projectId }) {
    const { followers } = await this.fetchProject({ projectId })
    return this.constructor.render({ followers })
  }
}
