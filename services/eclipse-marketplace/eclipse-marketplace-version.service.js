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

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ name }) {
    const { marketplace } = await this.fetch({
      name,
      schema: versionResponseSchema,
    })
    const version = marketplace.node.version
    return this.constructor.render({ version })
  }
}
