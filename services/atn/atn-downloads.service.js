import { renderDownloadsBadge } from '../downloads.js'
import { pathParams } from '../index.js'
import { BaseAtnService, description } from './atn-base.js'

export default class AtnWeeklyDownloads extends BaseAtnService {
  static category = 'downloads'
  static route = { base: 'atn/dw', pattern: ':addonId' }

  static openApi = {
    '/atn/dw/{addonId}': {
      get: {
        summary: 'Thunderbird Add-on Downloads',
        description,
        parameters: pathParams({
          name: 'addonId',
          example: 'unicodify-text-transformer',
        }),
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
