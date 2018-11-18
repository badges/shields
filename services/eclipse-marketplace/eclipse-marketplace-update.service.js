'use strict'

const Joi = require('joi')
const EclipseMarketplaceBase = require('./eclipse-marketplace-base')
const { formatDate } = require('../../lib/text-formatters')
const { age: ageColor } = require('../../lib/color-formatters')
const { nonNegativeInteger } = require('../validators')

const updateResponseSchema = Joi.object({
  marketplace: Joi.object({
    node: Joi.object({
      changed: nonNegativeInteger,
    }),
  }),
}).required()

module.exports = class EclipseMarketplaceUpdate extends EclipseMarketplaceBase {
  static get category() {
    return 'other'
  }

  static get defaultBadgeData() {
    return { label: 'updated' }
  }

  static get examples() {
    return [
      {
        title: 'Eclipse Marketplace',
        exampleUrl: 'notepad4e',
        pattern: ':name',
        staticExample: this.render({ date: new Date().getTime() }),
      },
    ]
  }

  static get route() {
    return this.buildRoute('eclipse-marketplace/last-update')
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
