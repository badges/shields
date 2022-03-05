import { renderDownloadsBadge } from '../downloads.js'
import { BaseAmoService, keywords } from './amo-base.js'

export default class AmoUsers extends BaseAmoService {
  static category = 'downloads'
  static route = { base: 'amo/users', pattern: ':addonId' }

  static examples = [
    {
      title: 'Mozilla Add-on',
      namedParams: { addonId: 'dustman' },
      staticPreview: this.render({ users: 750 }),
      keywords,
    },
  ]

  static _cacheLength = 21600

  static defaultBadgeData = { label: 'users' }

  static render({ users: downloads }) {
    return renderDownloadsBadge({ downloads, colorOverride: 'blue' })
  }

  async handle({ addonId }) {
    const data = await this.fetch({ addonId })
    return this.constructor.render({ users: data.average_daily_users })
  }
}
