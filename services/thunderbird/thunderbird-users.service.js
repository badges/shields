import { renderDownloadsBadge } from '../downloads.js'
import { pathParams } from '../index.js'
import { BaseThunderbirdService, description } from './thunderbird-base.js'

export default class ThunderbirdUsers extends BaseThunderbirdService {
  static category = 'downloads'
  static route = { base: 'thunderbird/users', pattern: ':addonId' }

  static openApi = {
    '/thunderbird/users/{addonId}': {
      get: {
        summary: 'Thunderbird Add-on Users',
        description,
        parameters: pathParams({ name: 'addonId', example: 'cardbook' }),
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
