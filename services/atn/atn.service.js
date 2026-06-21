import { renderDownloadsBadge } from '../downloads.js'
import { pathParams } from '../index.js'
import { BaseAtnService, description } from './atn-base.js'

export default class AtnUsers extends BaseAtnService {
  static category = 'downloads'
  static route = { base: 'atn/users', pattern: ':addonId' }

  static openApi = {
    '/atn/users/{addonId}': {
      get: {
        summary: 'Thunderbird Add-on Users',
        description,
        parameters: pathParams({
          name: 'addonId',
          example: 'unicodify-text-transformer',
        }),
      },
    },
  }

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
