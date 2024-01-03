import Joi from 'joi'
import { pathParams } from '../index.js'
import { formatDate } from '../text-formatters.js'
import { age as ageColor } from '../color-formatters.js'
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

  static render({ date }) {
    return {
      message: formatDate(date),
      color: ageColor(date),
    }
  }

  async handle({ name }) {
    const { marketplace } = await this.fetch({
      name,
      schema: updateResponseSchema,
    })
    const date = 1000 * parseInt(marketplace.node.changed)
    return this.constructor.render({ date })
  }
}
