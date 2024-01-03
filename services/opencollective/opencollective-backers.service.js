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

  static _cacheLength = 3600

  static defaultBadgeData = {
    label: 'backers',
  }

  async handle({ collective }) {
    const data = await this.fetchCollectiveInfo({
      collective,
      accountType: ['INDIVIDUAL'],
    })
    const backersCount = this.getCount(data)

    return this.constructor.render(backersCount)
  }
}
