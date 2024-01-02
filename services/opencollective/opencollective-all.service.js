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

  static _cacheLength = 3600

  static defaultBadgeData = {
    label: 'backers and sponsors',
  }

  async handle({ collective }) {
    const data = await this.fetchCollectiveInfo({
      collective,
      accountType: [],
    })
    const backersCount = this.getCount(data)
    return this.constructor.render(backersCount)
  }
}
