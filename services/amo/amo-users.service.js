import { renderDownloadsBadge } from '../downloads.js'
import { pathParam, queryParam } from '../index.js'
import { BaseAmoService, description, queryParamSchema } from './amo-base.js'

export default class AmoUsers extends BaseAmoService {
  static category = 'downloads'
  static route = { base: 'amo/users', pattern: ':addonId', queryParamSchema }

  static openApi = {
    '/amo/users/{addonId}': {
      get: {
        summary: 'Mozilla Add-on Users',
        description,
        parameters: [
          pathParam({ name: 'addonId', example: 'dustman' }),
          queryParam({
            name: 'registry',
            example: 'thunderbird',
            schema: { type: 'string', enum: ['firefox', 'thunderbird'] },
            description:
              'Registry to use. Can be `firefox` (default) or `thunderbird`.',
          }),
        ],
      },
    },
  }

  static _cacheLength = 21600

  static defaultBadgeData = { label: 'users' }

  static render({ users: downloads }) {
    return renderDownloadsBadge({ downloads, colorOverride: 'blue' })
  }

  async handle({ addonId }, { registry }) {
    const data = await this.fetch({ addonId, registry })
    return this.constructor.render({ users: data.average_daily_users })
  }
}
