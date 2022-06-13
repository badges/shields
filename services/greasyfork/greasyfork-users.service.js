import { renderDownloadsBadge } from '../downloads.js'
import { BaseGreasyForkService, keywords } from './greasyfork-base.js'

export default class GreasyForkUsers extends BaseGreasyForkService {
  static category = 'downloads'
  static route = { base: 'greasyfork/users', pattern: ':scriptId' }

  static examples = [
    {
      title: 'Greasy Fork',
      namedParams: { scriptId: '407466' },
      staticPreview: this.render({ users: 3420 }),
      keywords,
    },
  ]

  static _cacheLength = 21600

  static defaultBadgeData = { label: 'users' }

  static render({ users: downloads }) {
    return renderDownloadsBadge({ downloads, colorOverride: 'blue' })
  }

  async handle({ scriptId }) {
    const data = await this.fetch({ scriptId })
    return this.constructor.render({ users: data.total_installs })
  }
}
