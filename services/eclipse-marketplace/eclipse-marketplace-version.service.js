'use strict'

const Joi = require('joi')
const EclipseMarketplaceBase = require('./eclipse-marketplace-base')
const { renderVersionBadge } = require('../../lib/version')

const versionResponseSchema = Joi.object({
  marketplace: Joi.object({
    node: Joi.array()
      .items(
        Joi.object({
          version: Joi.array()
            .items(Joi.string().required())
            .min(1)
            .required(),
        })
      )
      .min(1)
      .required(),
  }),
}).required()

module.exports = class EclipseMarketplaceVersion extends EclipseMarketplaceBase {
  static get category() {
    return 'version'
  }

  static get defaultBadgeData() {
    return { label: 'eclipse marketplace' }
  }

  static get examples() {
    return [
      {
        title: 'Eclipse Marketplace',
        exampleUrl: 'notepad4e',
        urlPattern: ':name',
        staticExample: this.render({ version: '1.0.1' }),
      },
    ]
  }

  static get url() {
    return this.buildUrl('eclipse-marketplace/v')
  }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ name }) {
    const { marketplace } = await this.fetch({
      name,
      schema: versionResponseSchema,
    })
    const version = marketplace.node[0].version[0]
    return this.constructor.render({ version })
  }
}
