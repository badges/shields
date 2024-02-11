import { pathParams } from '../index.js'
import { renderDownloadsBadge } from '../downloads.js'
import { BaseHangarService, description } from './hangar-base.js'

export default class HangarDownloads extends BaseHangarService {
  static category = 'downloads'

  static route = {
    base: 'hangar/dt',
    pattern: ':slug',
  }

  static openApi = {
    '/hangar/dt/{slug}': {
      get: {
        summary: 'Hangar Downloads',
        description,
        parameters: pathParams({
          name: 'slug',
          example: 'Essentials',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'downloads' }

  async handle({ slug }) {
    const {
      stats: { downloads },
    } = await this.fetch({ slug })
    return renderDownloadsBadge({ downloads })
  }
}
