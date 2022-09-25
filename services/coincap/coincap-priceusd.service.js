import Joi from 'joi'
import BaseCoincapService from './coincap-base.js'

const schema = Joi.object({
  data: Joi.object({
    priceUsd: Joi.string().required(),
    name: Joi.string().required(),
  }).required(),
}).required()

export default class CoincapPriceUsd extends BaseCoincapService {
  static route = { base: 'coincap/priceUsd', pattern: ':assetId' }

  static examples = [
    {
      title: 'Coincap (Price USD)',
      namedParams: { assetId: 'bitcoin' },
      staticPreview: this.render({
        asset: { priceUsd: '19116.0479117336250772' },
      }),
      keywords: ['bitcoin', 'crypto', 'cryptocurrency'],
    },
  ]

  static priceFormat(price) {
    return `$${parseFloat(price)
      .toFixed(2)
      .replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
  }

  static render({ asset }) {
    return {
      label: asset.name,
      message: this.priceFormat(asset.priceUsd),
      color: 'green',
    }
  }

  async handle({ assetId }) {
    const { data: asset } = await this.fetch({ assetId, schema })
    return this.constructor.render({ asset })
  }
}
