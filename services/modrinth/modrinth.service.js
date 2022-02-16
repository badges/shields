import Joi from 'joi'
import { BaseJsonService } from '../index.js'
import { renderDownloadsBadge } from '../downloads.js'
import { nonNegativeInteger } from '../validators.js'

const schema = Joi.object({
  downloads: nonNegativeInteger,
}).required()

export default class Modrinth extends BaseJsonService {
  static category = 'downloads'

  static route = {
    base: 'modrinth/dt',
    pattern: ':modId',
  }

  static examples = [
    {
      title: 'Modrinth',
      namedParams: { modId: 'AANobbMI' },
      staticPreview: renderDownloadsBadge({ downloads: 120000 }),
    },
  ]

  static defaultBadgeData = { label: 'downloads' }

  async fetch({ modId }) {
    return this._requestJson({
      schema,
      url: `https://api.modrinth.com/api/v1/mod/${modId}`,
    })
  }

  async handle({ modId }) {
    const { downloads } = await this.fetch({ modId })
    return renderDownloadsBadge({ downloads })
  }
}
