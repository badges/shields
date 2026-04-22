import { renderDownloadsBadge } from '../downloads.js'
import { deprecatedService, pathParam, queryParam } from '../index.js'
import {
  BaseAmoService,
  description as baseDescription,
  queryParamSchema,
} from './amo-base.js'

const description = `${baseDescription}

Previously \`amo/d\` provided a &ldquo;total downloads&rdquo; badge. However,
[updates to the v3 API](https://github.com/badges/shields/issues/3079)
only give us weekly downloads. The route \`amo/d\` redirects to \`amo/dw\`.
`

class AmoWeeklyDownloads extends BaseAmoService {
  static category = 'downloads'
  static route = { base: 'amo/dw', pattern: ':addonId', queryParamSchema }

  static openApi = {
    '/amo/dw/{addonId}': {
      get: {
        summary: 'Mozilla Add-on Downloads',
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

  static defaultBadgeData = { label: 'downloads' }

  static render({ downloads }) {
    return renderDownloadsBadge({ downloads, interval: 'week' })
  }

  async handle({ addonId }, { registry }) {
    const data = await this.fetch({ addonId, registry })
    return this.constructor.render({
      downloads: data.weekly_downloads,
    })
  }
}

const AmoLegacyRedirect = deprecatedService({
  category: 'downloads',
  label: 'mozilla-add-on',
  route: {
    base: 'amo/d',
    pattern: ':addonId',
  },
  dateAdded: new Date('2025-12-20'),
  issueUrl: 'https://github.com/badges/shields/pull/11583',
})

export { AmoWeeklyDownloads, AmoLegacyRedirect }
