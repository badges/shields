import { renderDownloadsBadge } from '../downloads.js'
import { BaseGreasyForkService, keywords } from './greasyfork-base.js'

class GreasyForkDailyDownloads extends BaseGreasyForkService {
  static category = 'downloads'
  static route = { base: 'greasyfork/dd', pattern: ':scriptId' }

  static examples = [
    {
      title: 'Greasy Fork',
      namedParams: { scriptId: '407466' },
      staticPreview: this.render({ downloads: 17 }),
      keywords,
    },
  ]

  static _cacheLength = 21600

  static defaultBadgeData = { label: 'downloads' }

  static render({ downloads }) {
    return renderDownloadsBadge({ downloads, interval: 'day' })
  }

  async handle({ scriptId }) {
    const data = await this.fetch({ scriptId })
    return this.constructor.render({
      downloads: data.daily_installs,
    })
  }
}

export { GreasyForkDailyDownloads }
