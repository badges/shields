import { renderDownloadsBadge } from '../downloads.js'
import { pathParams } from '../index.js'
import { BaseThunderbirdService, description } from './thunderbird-base.js'

export default class ThunderbirdWeeklyDownloads extends BaseThunderbirdService {
  static category = 'downloads'
  static route = { base: 'thunderbird/dw', pattern: ':addonId' }

  static openApi = {
    '/thunderbird/dw/{addonId}': {
      get: {
        summary: 'Thunderbird Add-on Downloads',
        description,
        parameters: pathParams({ name: 'addonId', example: 'cardbook' }),
      },
    },
  }

  static _cacheLength = 21600

  static defaultBadgeData = { label: 'downloads' }

  static render({ downloads }) {
    return renderDownloadsBadge({ downloads, interval: 'week' })
  }

  async handle({ addonId }) {
    const data = await this.fetch({ addonId })
    return this.constructor.render({
      downloads: data.weekly_downloads,
    })
  }
}
