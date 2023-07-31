import Joi from 'joi'
import { BaseJsonService, pathParams } from '../index.js'
import { renderDownloadsBadge } from '../downloads.js'

const schema = Joi.object({
  installs_total: Joi.number().integer().required(),
}).required()

export default class FlathubDownloads extends BaseJsonService {
  static category = 'downloads'
  static route = { base: 'flathub/downloads', pattern: ':packageName' }
  static openApi = {
    '/flathub/downloads/{packageName}': {
      get: {
        summary: 'Flathub Downloads',
        parameters: pathParams({
          name: 'packageName',
          example: 'org.mozilla.firefox',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'installs' }

  async handle({ packageName }) {
    const data = await this._requestJson({
      schema,
      url: `https://flathub.org/api/v2/stats/${encodeURIComponent(
        packageName,
      )}`,
    })
    return renderDownloadsBadge({ downloads: data.installs_total })
  }
}
