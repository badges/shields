import { renderDownloadsBadge } from '../downloads.js'
import { BaseClojarsService } from './clojars-base.js'

export default class ClojarsDownloads extends BaseClojarsService {
  static category = 'downloads'
  static route = { base: 'clojars/dt', pattern: ':clojar+' }

  static examples = [
    {
      namedParams: { clojar: 'prismic' },
      staticPreview: renderDownloadsBadge({ downloads: 117 }),
    },
  ]

  static defaultBadgeData = { label: 'downloads' }

  async handle({ clojar }) {
    const json = await this.fetch({ clojar })
    return renderDownloadsBadge({ downloads: json.downloads })
  }
}
