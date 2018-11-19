'use strict'

const Joi = require('joi')
const EclipseMarketplaceBase = require('./eclipse-marketplace-base')
const { nonNegativeInteger } = require('../validators')

const favoritesResponseSchema = Joi.object({
  marketplace: Joi.object({
    node: Joi.object({
      favorited: nonNegativeInteger,
    }),
  }),
}).required()

module.exports = class EclipseMarketplaceFavorites extends EclipseMarketplaceBase {
  static get category() {
    return 'other'
  }

  static get defaultBadgeData() {
    return { label: 'favorites' }
  }

  static get examples() {
    return [
      {
        title: 'Eclipse Marketplace',
        exampleUrl: 'notepad4e',
        pattern: ':name',
        staticExample: this.render({ favorited: 55 }),
      },
    ]
  }

  static get route() {
    return this.buildRoute('eclipse-marketplace/favorites')
  }

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
