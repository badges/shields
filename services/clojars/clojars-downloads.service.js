import { metric } from '../text-formatters.js'
import { downloadCount as downloadsColor } from '../color-formatters.js'
import { BaseClojarsService } from './clojars-base.js'

export default class ClojarsDownloads extends BaseClojarsService {
  static category = 'downloads'
  static route = { base: 'clojars/dt', pattern: ':clojar+' }

  static examples = [
    {
      namedParams: { clojar: 'prismic' },
      staticPreview: this.render({ downloads: 117 }),
    },
  ]

  static defaultBadgeData = { label: 'downloads' }

  static render({ downloads }) {
    return {
      label: 'downloads',
      message: metric(downloads),
      color: downloadsColor(downloads),
    }
  }

  async handle({ clojar }) {
    const json = await this.fetch({ clojar })
    return this.constructor.render({ downloads: json.downloads })
  }
}
