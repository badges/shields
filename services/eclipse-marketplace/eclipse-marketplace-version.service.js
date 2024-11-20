import Joi from 'joi'
import { pathParams } from '../index.js'
import { renderVersionBadge } from '../version.js'
import EclipseMarketplaceBase from './eclipse-marketplace-base.js'

const versionResponseSchema = Joi.object({
  marketplace: Joi.object({
    node: Joi.object({
      version: Joi.string().required(),
    }),
  }),
}).required()

export default class EclipseMarketplaceVersion extends EclipseMarketplaceBase {
  static category = 'version'
  static route = {
    base: 'eclipse-marketplace/v',
    pattern: ':name',
  }

  static openApi = {
    '/eclipse-marketplace/v/{name}': {
      get: {
        summary: 'Eclipse Marketplace Version',
        parameters: pathParams({
          name: 'name',
          example: 'notepad4e',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'eclipse marketplace' }

  async handle({ name }, { versionPrefix }) {
    const { marketplace } = await this.fetch({
      name,
      schema: versionResponseSchema,
    })
    const version = marketplace.node.version
    return renderVersionBadge({ version, prefix: versionPrefix })
  }
}
