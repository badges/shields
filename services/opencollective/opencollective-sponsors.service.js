import { pathParams } from '../index.js'
import OpencollectiveBase from './opencollective-base.js'

export default class OpencollectiveSponsors extends OpencollectiveBase {
  static route = this.buildRoute('sponsors')

  static openApi = {
    '/opencollective/sponsors/{collective}': {
      get: {
        summary: 'Open Collective sponsors',
        parameters: pathParams({
          name: 'collective',
          example: 'shields',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'sponsors',
  }

  async handle({ collective }) {
    const { backersCount } = await this.fetchCollectiveBackersCount(
      collective,
      { userType: 'organizations' },
    )
    return this.constructor.render(backersCount)
  }
}
