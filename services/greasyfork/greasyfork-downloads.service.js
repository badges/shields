import { renderDownloadsBadge } from '../downloads.js'
import BaseGreasyForkService from './greasyfork-base.js'

class BaseGreasyForkInstalls extends BaseGreasyForkService {
  static category = 'downloads'

  static defaultBadgeData = { label: 'installs' }
}

class GreasyForkDailyInstalls extends BaseGreasyForkInstalls {
  static route = { base: 'greasyfork/dd', pattern: ':scriptId' }

  static examples = [
    {
      title: 'Greasy Fork',
      namedParams: { scriptId: '407466' },
      staticPreview: this.render({ downloads: 17 }),
    },
  ]

  static _cacheLength = 21600

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

class GreasyForkTotalInstalls extends BaseGreasyForkInstalls {
  static route = { base: 'greasyfork/dt', pattern: ':scriptId' }

  static examples = [
    {
      title: 'Greasy Fork',
      namedParams: { scriptId: '407466' },
      staticPreview: this.render({ downloads: 17 }),
    },
  ]

  static _cacheLength = 21600

  static render({ users: downloads }) {
    return renderDownloadsBadge({ downloads })
  }

  async handle({ scriptId }) {
    const data = await this.fetch({ scriptId })
    return this.constructor.render({ downloads: data.total_installs })
  }
}

export { GreasyForkDailyInstalls, GreasyForkTotalInstalls }
