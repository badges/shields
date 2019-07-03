'use strict'

const Joi = require('@hapi/joi')
const { formatDate } = require('../text-formatters')
const { age: ageColor } = require('../color-formatters')
const { nonNegativeInteger } = require('../validators')
const EclipseMarketplaceBase = require('./eclipse-marketplace-base')

const updateResponseSchema = Joi.object({
  marketplace: Joi.object({
    node: Joi.object({
      changed: nonNegativeInteger,
    }),
  }),
}).required()

module.exports = class EclipseMarketplaceUpdate extends EclipseMarketplaceBase {
  static get category() {
    return 'activity'
  }

  static get route() {
    return this.buildRoute('eclipse-marketplace/last-update')
  }

  static get examples() {
    return [
      {
        title: 'Eclipse Marketplace',
        namedParams: { name: 'notepad4e' },
        staticPreview: this.render({ date: new Date().getTime() }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'updated' }
  }

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
