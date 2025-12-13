import { pathParams } from '../index.js'
import { renderDownloadsBadge } from '../downloads.js'
import BaseGreasyForkService from './greasyfork-base.js'

export default class GreasyForkInstalls extends BaseGreasyForkService {
  static category = 'downloads'
  static route = { base: 'greasyfork', pattern: ':variant(dt|dd)/:scriptId' }

  static openApi = {
    '/greasyfork/{variant}/{scriptId}': {
      get: {
        summary: 'Greasy Fork Downloads',
        parameters: pathParams(
          {
            name: 'variant',
            example: 'dt',
            description: 'total downloads or daily downloads',
            schema: { type: 'string', enum: this.getEnum('variant') },
          },
          {
            name: 'scriptId',
            example: '407466',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'installs' }

  async handle({ variant, scriptId }) {
    const data = await this.fetch({ scriptId })
    if (variant === 'dd') {
      const downloads = data.daily_installs
      const interval = 'day'
      return renderDownloadsBadge({ downloads, interval })
    }
    const downloads = data.total_installs
    return renderDownloadsBadge({ downloads })
  }
}
