import Joi from 'joi'
import { pathParams } from '../index.js'
import { renderVersionBadge } from '../version.js'
import { BaseSpigetService, description } from './spiget-base.js'

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

  static openApi = {
    '/spiget/version/{resourceId}': {
      get: {
        summary: 'Spiget Version',
        description,
        parameters: pathParams({
          name: 'resourceId',
          example: '9089',
        }),
      },
    },
  }

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
