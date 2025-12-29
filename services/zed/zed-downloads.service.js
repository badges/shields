import Joi from 'joi'
import { BaseJsonService, pathParams } from '../index.js'
import { renderDownloadsBadge } from '../downloads.js'

const schema = Joi.object({
  data: Joi.array()
    .items(
      Joi.object({
        download_count: Joi.number().integer().required(),
      })
        .min(1)
        .required(),
    )
    .required(),
}).required()

export default class ZedDownloads extends BaseJsonService {
  static category = 'downloads'
  static route = { base: 'zed/downloads', pattern: ':extensionId' }
  static openApi = {
    '/zed/downloads/{extensionId}': {
      get: {
        summary: 'Zed Downloads',
        parameters: pathParams({
          name: 'extensionId',
          example: 'react-snippets-es7',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'installs' }

  async handle({ extensionId }) {
    const data = await this._requestJson({
      schema,
      url: `https://api.zed.dev/extensions/${encodeURIComponent(extensionId)}`,
    })

    return renderDownloadsBadge({ downloads: data.data.at(-1).download_count })
  }
}
