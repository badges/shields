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
    pattern: ':projectId',
  }

  static examples = [
    {
      title: 'Modrinth',
      namedParams: { projectId: 'AANobbMI' },
      staticPreview: renderDownloadsBadge({ downloads: 120000 }),
    },
  ]

  static defaultBadgeData = { label: 'downloads' }

  async fetch({ projectId }) {
    return this._requestJson({
      schema,
      url: `https://api.modrinth.com/v2/project/${projectId}`,
    })
  }

  async handle({ projectId }) {
    const { downloads } = await this.fetch({ projectId })
    return renderDownloadsBadge({ downloads })
  }
}
