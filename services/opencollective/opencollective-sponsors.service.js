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

  static _cacheLength = 3600

  static defaultBadgeData = {
    label: 'sponsors',
  }

  async handle({ collective }) {
    const data = await this.fetchCollectiveInfo({
      collective,
      accountType: ['ORGANIZATION'],
    })
    const backersCount = this.getCount(data)
    return this.constructor.render(backersCount)
  }
}
