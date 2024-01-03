import { renderDownloadsBadge } from '../downloads.js'
import { pathParams } from '../index.js'
import { BaseAmoService, description } from './amo-base.js'

export default class AmoUsers extends BaseAmoService {
  static category = 'downloads'
  static route = { base: 'amo/users', pattern: ':addonId' }

  static openApi = {
    '/amo/users/{addonId}': {
      get: {
        summary: 'Mozilla Add-on Users',
        description,
        parameters: pathParams({ name: 'addonId', example: 'dustman' }),
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
