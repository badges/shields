'use strict'

const Joi = require('@hapi/joi')
const EclipseMarketplaceBase = require('./eclipse-marketplace-base')

const licenseResponseSchema = Joi.object({
  marketplace: Joi.object({
    node: Joi.object({
      license: Joi.string()
        .allow('')
        .required(),
    }),
  }),
}).required()

module.exports = class EclipseMarketplaceLicense extends EclipseMarketplaceBase {
  static get category() {
    return 'license'
  }

  static get route() {
    return this.buildRoute('eclipse-marketplace/l')
  }

  static get examples() {
    return [
      {
        title: 'Eclipse Marketplace',
        namedParams: { name: 'notepad4e' },
        staticPreview: this.render({ license: 'GPL' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'license' }
  }

  static render({ license }) {
    if (license === '') {
      return {
        message: 'not specified',
      }
    }
    return {
      message: license,
      color: 'blue',
    }
  }

  async handle({ name }) {
    const { marketplace } = await this.fetch({
      name,
      schema: licenseResponseSchema,
    })
    const license = marketplace.node.license
    return this.constructor.render({ license })
  }
}
