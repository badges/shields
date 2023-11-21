import { renderDownloadsBadge } from '../downloads.js'
import { redirector, pathParams } from '../index.js'
import { BaseAmoService, description as baseDescription } from './amo-base.js'

const description = `${baseDescription}

Previously \`amo/d\` provided a &ldquo;total downloads&rdquo; badge. However,
[updates to the v3 API](https://github.com/badges/shields/issues/3079)
only give us weekly downloads. The route \`amo/d\` redirects to \`amo/dw\`.
`

class AmoWeeklyDownloads extends BaseAmoService {
  static category = 'downloads'
  static route = { base: 'amo/dw', pattern: ':addonId' }

  static openApi = {
    '/amo/dw/{addonId}': {
      get: {
        summary: 'Mozilla Add-on Downloads',
        description,
        parameters: pathParams({ name: 'addonId', example: 'dustman' }),
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

const AmoLegacyRedirect = redirector({
  category: 'downloads',
  route: {
    base: 'amo/d',
    pattern: ':addonId',
  },
  transformPath: ({ addonId }) => `/amo/dw/${addonId}`,
  dateAdded: new Date('2019-02-23'),
})

export { AmoWeeklyDownloads, AmoLegacyRedirect }
