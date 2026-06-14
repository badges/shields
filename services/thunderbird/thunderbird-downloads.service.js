import { renderDownloadsBadge } from '../downloads.js'
import { retiredService, pathParams } from '../index.js'
import {
  BaseThunderbirdService,
  description as baseDescription,
} from './thunderbird-base.js'

const description = `${baseDescription}

Previously \`thunderbird/d\` provided a &ldquo;total downloads&rdquo; badge. However,
[updates to the v3 API](https://github.com/badges/shields/issues/3079)
only give us weekly downloads. The route \`thunderbird/d\` redirects to \`thunderbird/dw\`.
`

class ThunderbirdWeeklyDownloads extends BaseThunderbirdService {
  static category = 'downloads'
  static route = { base: 'thunderbird/dw', pattern: ':addonId' }

  static openApi = {
    '/thunderbird/dw/{addonId}': {
      get: {
        summary: 'Thunderbird Add-on Downloads',
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

export { ThunderbirdWeeklyDownloads }
