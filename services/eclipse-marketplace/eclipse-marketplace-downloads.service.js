'use strict'

const Joi = require('joi')
const EclipseMarketplaceBase = require('./eclipse-marketplace-base')
const { metric } = require('../../lib/text-formatters')
const {
  downloadCount: downloadCountColor,
} = require('../../lib/color-formatters')
const { nonNegativeInteger } = require('../validators')

const monthlyResponseSchema = Joi.object({
  marketplace: Joi.object({
    node: Joi.object({
      installsrecent: nonNegativeInteger,
    }),
  }),
}).required()

const totalResponseSchema = Joi.object({
  marketplace: Joi.object({
    node: Joi.object({
      installstotal: nonNegativeInteger,
    }),
  }),
}).required()

function DownloadsForInterval(interval) {
  const { base, schema, messageSuffix = '' } = {
    month: {
      base: 'eclipse-marketplace/dm',
      messageSuffix: '/month',
      schema: monthlyResponseSchema,
    },
    total: {
      base: 'eclipse-marketplace/dt',
      schema: totalResponseSchema,
    },
  }[interval]

  return class EclipseMarketplaceDownloads extends EclipseMarketplaceBase {
    static get category() {
      return 'downloads'
    }

    static get examples() {
      return [
        {
          title: 'Eclipse Marketplace',
          exampleUrl: 'notepad4e',
          pattern: ':name',
          staticExample: this.render({ downloads: 30000 }),
        },
      ]
    }

    static get route() {
      return this.buildRoute(base)
    }

    static render({ downloads }) {
      return {
        message: `${metric(downloads)}${messageSuffix}`,
        color: downloadCountColor(downloads),
      }
    }

    async handle({ name }) {
      const { marketplace } = await this.fetch({ name, schema })
      const downloads =
        interval === 'total'
          ? marketplace.node.installstotal
          : marketplace.node.installsrecent
      return this.constructor.render({ downloads })
    }
  }
}

module.exports = ['month', 'total'].map(DownloadsForInterval)
