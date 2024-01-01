import Joi from 'joi'
import { renderDownloadsBadge } from '../downloads.js'
import { pathParams } from '../index.js'
import { nonNegativeInteger } from '../validators.js'
import EclipseMarketplaceBase from './eclipse-marketplace-base.js'

const downloadsResponseSchema = Joi.object({
  marketplace: Joi.object({
    node: Joi.object({
      installsrecent: nonNegativeInteger,
      installstotal: nonNegativeInteger,
    }),
  }),
}).required()

export default class EclipseMarketplaceDownloads extends EclipseMarketplaceBase {
  static category = 'downloads'
  static route = {
    base: 'eclipse-marketplace',
    pattern: ':interval(dm|dt)/:name',
  }

  static openApi = {
    '/eclipse-marketplace/{interval}/{name}': {
      get: {
        summary: 'Eclipse Marketplace Downloads',
        parameters: pathParams(
          {
            name: 'interval',
            example: 'dt',
            schema: { type: 'string', enum: this.getEnum('interval') },
            description: 'Monthly or Total downloads',
          },
          {
            name: 'name',
            example: 'planet-themes',
          },
        ),
      },
    },
  }

  static render({ interval, downloads }) {
    const intervalString = interval === 'dm' ? 'month' : null
    return renderDownloadsBadge({ downloads, interval: intervalString })
  }

  async handle({ interval, name }) {
    const { marketplace } = await this.fetch({
      schema: downloadsResponseSchema,
      name,
    })
    const downloads =
      interval === 'dt'
        ? marketplace.node.installstotal
        : marketplace.node.installsrecent
    return this.constructor.render({ downloads, interval })
  }
}
