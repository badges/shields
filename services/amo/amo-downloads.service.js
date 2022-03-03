import { renderDownloadsBadge } from '../downloads.js'
import { redirector } from '../index.js'
import { BaseAmoService, keywords } from './amo-base.js'

const documentation = `
<p>
  Previously <code>amo/d</code> provided a &ldquo;total downloads&rdquo; badge. However,
  <a href="https://github.com/badges/shields/issues/3079">updates to the v3 API</a> only
  give us weekly downloads. The route <code>amo/d</code> redirects to <code>amo/dw</code>.
</p>
`

class AmoWeeklyDownloads extends BaseAmoService {
  static category = 'downloads'
  static route = { base: 'amo/dw', pattern: ':addonId' }

  static examples = [
    {
      title: 'Mozilla Add-on',
      namedParams: { addonId: 'dustman' },
      staticPreview: this.render({ downloads: 120 }),
      keywords,
      documentation,
    },
  ]

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
