import Joi from 'joi'
import { BaseJsonService } from '../../core/base-service/index.js'
import { renderDownloadsBadge } from '../downloads.js'
import { nonNegativeInteger } from '../validators.js'

const schema = Joi.object({
  downloadCount: nonNegativeInteger,
})

export default class CurseforgeService extends BaseJsonService {
  static category = 'downloads'

  static route = {
    base: 'curseforge/dt',
    pattern: ':modId',
  }

  static auth = {
    passKey: 'curseforge_api_token',
    authorizedOrigins: ['https://api.curseforge.com'],
  }

  static examples = [
    {
      title: 'Curseforge',
      namedParams: { modId: '000000' },
      staticPreview: renderDownloadsBadge({ downloads: 120000 }),
    },
  ]

  static defaultBadgeData = { label: 'downloads', color: 'orange' }

  async fetch({ modId }) {
    return (
      await this._requestJson(
        this.authHelper.withApiKeyHeader({
          schema: Joi.object({ data: schema }).required(),
          url: `https://api.curseforge.com/v1/mods/${modId}`,
          errorMessages: {
            403: 'API-Token missing',
          },
        })
      )
    ).data
  }

  async handle({ modId }) {
    const { downloadCount } = await this.fetch({ modId })
    return renderDownloadsBadge({ downloads: downloadCount })
  }
}
