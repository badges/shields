'use strict'

const Joi = require('joi')
const { nonNegativeInteger } = require('../validators')
const EclipseMarketplaceBase = require('./eclipse-marketplace-base')

const favoritesResponseSchema = Joi.object({
  marketplace: Joi.object({
    node: Joi.object({
      favorited: nonNegativeInteger,
    }),
  }),
}).required()

module.exports = class EclipseMarketplaceFavorites extends (
  EclipseMarketplaceBase
) {
  static category = 'other'
  static route = this.buildRoute('eclipse-marketplace/favorites')
  static examples = [
    {
      title: 'Eclipse Marketplace',
      namedParams: { name: 'notepad4e' },
      staticPreview: this.render({ favorited: 55 }),
    },
  ]

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
