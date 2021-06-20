import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { downloadCount as downloadCountColor } from '../color-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import EclipseMarketplaceBase from './eclipse-marketplace-base.js'

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
  const {
    base,
    schema,
    messageSuffix = '',
    name,
  } = {
    month: {
      base: 'eclipse-marketplace/dm',
      messageSuffix: '/month',
      schema: monthlyResponseSchema,
      name: 'EclipseMarketplaceDownloadsMonth',
    },
    total: {
      base: 'eclipse-marketplace/dt',
      schema: totalResponseSchema,
      name: 'EclipseMarketplaceDownloadsTotal',
    },
  }[interval]

  return class EclipseMarketplaceDownloads extends EclipseMarketplaceBase {
    static name = name
    static category = 'downloads'
    static route = this.buildRoute(base)
    static examples = [
      {
        title: 'Eclipse Marketplace',
        namedParams: { name: 'notepad4e' },
        staticPreview: this.render({ downloads: 30000 }),
      },
    ]

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

export default ['month', 'total'].map(DownloadsForInterval)
