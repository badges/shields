import Joi from 'joi'
import { pathParams } from '../index.js'
import { renderDateBadge } from '../date.js'
import { nonNegativeInteger } from '../validators.js'
import EclipseMarketplaceBase from './eclipse-marketplace-base.js'

const updateResponseSchema = Joi.object({
  marketplace: Joi.object({
    node: Joi.object({
      changed: nonNegativeInteger,
    }),
  }),
}).required()

export default class EclipseMarketplaceUpdate extends EclipseMarketplaceBase {
  static category = 'activity'
  static route = {
    base: 'eclipse-marketplace/last-update',
    pattern: ':name',
  }

  static openApi = {
    '/eclipse-marketplace/last-update/{name}': {
      get: {
        summary: 'Eclipse Marketplace Last Update',
        parameters: pathParams({
          name: 'name',
          example: 'notepad4e',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'updated' }

  async handle({ name }) {
    const { marketplace } = await this.fetch({
      name,
      schema: updateResponseSchema,
    })
    const date = 1000 * parseInt(marketplace.node.changed)
    return renderDateBadge(date)
  }
}
