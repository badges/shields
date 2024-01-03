import Joi from 'joi'
import { pathParams } from '../index.js'
import { nonNegativeInteger } from '../validators.js'
import EclipseMarketplaceBase from './eclipse-marketplace-base.js'

const favoritesResponseSchema = Joi.object({
  marketplace: Joi.object({
    node: Joi.object({
      favorited: nonNegativeInteger,
    }),
  }),
}).required()

export default class EclipseMarketplaceFavorites extends EclipseMarketplaceBase {
  static category = 'other'
  static route = {
    base: 'eclipse-marketplace/favorites',
    pattern: ':name',
  }

  static openApi = {
    '/eclipse-marketplace/favorites/{name}': {
      get: {
        summary: 'Eclipse Marketplace Favorites',
        parameters: pathParams({
          name: 'name',
          example: 'notepad4e',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'favorites' }

  static render({ favorited }) {
    return {
      message: favorited,
      color: 'brightgreen',
    }
  }

  async handle({ name }) {
    const { marketplace } = await this.fetch({
      name,
      schema: favoritesResponseSchema,
    })
    const favorited = marketplace.node.favorited
    return this.constructor.render({ favorited })
  }
}
