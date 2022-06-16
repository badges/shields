import { renderDownloadsBadge } from '../downloads.js'
import BaseGreasyForkService from './greasyfork-base.js'

export default class GreasyForkInstalls extends BaseGreasyForkService {
  static category = 'downloads'
  static route = { base: 'greasyfork', pattern: ':variant(dt|dd)/:scriptId' }

  static examples = [
    {
      title: 'Greasy Fork',
      pattern: 'dd/:scriptId',
      namedParams: { scriptId: '407466' },
      staticPreview: renderDownloadsBadge({ downloads: 17 }),
    },
    {
      title: 'Greasy Fork',
      pattern: 'dt/:scriptId',
      namedParams: { scriptId: '407466' },
      staticPreview: renderDownloadsBadge({ downloads: 3420 }),
    },
  ]

  static defaultBadgeData = { label: 'installs' }

  async handle({ variant, scriptId }) {
    const data = await this.fetch({ scriptId })
    if (variant === 'dd') {
      const downloads = data.daily_installs
      const interval = 'day'
      return renderDownloadsBadge({ downloads, interval })
    }
    const downloads = data.total_installs
    return renderDownloadsBadge({ downloads })
  }
}
