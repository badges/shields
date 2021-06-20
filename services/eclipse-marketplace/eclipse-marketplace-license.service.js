import Joi from 'joi'
import EclipseMarketplaceBase from './eclipse-marketplace-base.js'

const licenseResponseSchema = Joi.object({
  marketplace: Joi.object({
    node: Joi.object({
      license: Joi.string().allow('').required(),
    }),
  }),
}).required()

export default class EclipseMarketplaceLicense extends EclipseMarketplaceBase {
  static category = 'license'
  static route = this.buildRoute('eclipse-marketplace/l')
  static examples = [
    {
      title: 'Eclipse Marketplace',
      namedParams: { name: 'notepad4e' },
      staticPreview: this.render({ license: 'GPL' }),
    },
  ]

  static defaultBadgeData = { label: 'license' }

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
