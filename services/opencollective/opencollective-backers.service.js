import { pathParams } from '../index.js'
import OpencollectiveBase from './opencollective-base.js'

export default class OpencollectiveBackers extends OpencollectiveBase {
  static route = this.buildRoute('backers')

  static openApi = {
    '/opencollective/backers/{collective}': {
      get: {
        summary: 'Open Collective backers',
        parameters: pathParams({
          name: 'collective',
          example: 'shields',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'backers',
  }

  async handle({ collective }) {
    const { backersCount } = await this.fetchCollectiveBackersCount(
      collective,
      { userType: 'users' },
    )
    return this.constructor.render(backersCount)
  }
}
