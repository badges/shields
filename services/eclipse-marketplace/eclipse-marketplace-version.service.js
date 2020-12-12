'use strict'

const Joi = require('joi')
const { renderVersionBadge } = require('../version')
const EclipseMarketplaceBase = require('./eclipse-marketplace-base')

const versionResponseSchema = Joi.object({
  marketplace: Joi.object({
    node: Joi.object({
      version: Joi.string().required(),
    }),
  }),
}).required()

module.exports = class EclipseMarketplaceVersion extends (
  EclipseMarketplaceBase
) {
  static category = 'version'
  static route = this.buildRoute('eclipse-marketplace/v')
  static examples = [
    {
      title: 'Eclipse Marketplace',
      namedParams: { name: 'notepad4e' },
      staticPreview: this.render({ version: '1.0.1' }),
    },
  ]

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
