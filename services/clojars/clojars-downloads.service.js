import { pathParams } from '../index.js'
import { renderDownloadsBadge } from '../downloads.js'
import { BaseClojarsService } from './clojars-base.js'

export default class ClojarsDownloads extends BaseClojarsService {
  static category = 'downloads'
  static route = { base: 'clojars/dt', pattern: ':clojar+' }

  static openApi = {
    '/clojars/dt/{clojar}': {
      get: {
        summary: 'ClojarsDownloads',
        parameters: pathParams({
          name: 'clojar',
          example: 'prismic',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'downloads' }

  async handle({ clojar }) {
    const json = await this.fetch({ clojar })
    return renderDownloadsBadge({ downloads: json.downloads })
  }
}
