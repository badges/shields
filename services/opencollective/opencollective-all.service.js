import { pathParams } from '../index.js'
import OpencollectiveBase from './opencollective-base.js'

export default class OpencollectiveAll extends OpencollectiveBase {
  static route = this.buildRoute('all')

  static openApi = {
    '/opencollective/all/{collective}': {
      get: {
        summary: 'Open Collective backers and sponsors',
        parameters: pathParams({
          name: 'collective',
          example: 'shields',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'backers and sponsors',
  }

  async handle({ collective }) {
    const { backersCount } = await this.fetchCollectiveInfo(collective)
    return this.constructor.render(backersCount)
  }
}
