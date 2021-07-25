import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseSpigetService, documentation, keywords } from './spiget-base.js'

const versionSchema = Joi.object({
  downloads: Joi.number().required(),
  name: Joi.string().required(),
}).required()

export default class SpigetLatestVersion extends BaseSpigetService {
  static category = 'version'

  static route = {
    base: 'spiget/version',
    pattern: ':resourceId',
  }

  static examples = [
    {
      title: 'Spiget Version',
      namedParams: {
        resourceId: '9089',
      },
      staticPreview: renderVersionBadge({ version: 2.1 }),
      documentation,
      keywords,
    },
  ]

  static defaultBadgeData = {
    label: 'spiget',
    color: 'blue',
  }

  async handle({ resourceId }) {
    const { name } = await this.fetch({
      resourceId,
      schema: versionSchema,
      url: `https://api.spiget.org/v2/resources/${resourceId}/versions/latest`,
    })
    return renderVersionBadge({ version: name })
  }
}
