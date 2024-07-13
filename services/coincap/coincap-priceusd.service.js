import Joi from 'joi'
import { pathParams } from '../index.js'
import { BaseCoincapService, description } from './coincap-base.js'

const schema = Joi.object({
  data: Joi.object({
    priceUsd: Joi.string()
      .pattern(/[0-9]*\.[0-9]+/i)
      .required(),
    name: Joi.string().required(),
  }).required(),
}).required()

export default class CoincapPriceUsd extends BaseCoincapService {
  static route = { base: 'coincap/price-usd', pattern: ':assetId' }

  static openApi = {
    '/coincap/price-usd/{assetId}': {
      get: {
        summary: 'Coincap (Price USD)',
        description,
        parameters: pathParams({
          name: 'assetId',
          example: 'bitcoin',
        }),
      },
    },
  }

  static priceFormat(price) {
    return `$${parseFloat(price)
      .toFixed(2)
      .replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
  }

  static render({ asset }) {
    return {
      label: `${asset.name}`.toLowerCase(),
      message: this.priceFormat(asset.priceUsd),
      color: 'blue',
    }
  }

  async handle({ assetId }) {
    const { data: asset } = await this.fetch({ assetId, schema })
    return this.constructor.render({ asset })
  }
}
