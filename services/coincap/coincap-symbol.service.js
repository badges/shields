import Joi from 'joi'
import BaseCoincapService from './coincap-base.js'

const schema = Joi.object({
  data: Joi.object({
    symbol: Joi.string().required(),
    name: Joi.string().required(),
  }).required(),
}).required()

export default class CoincapSymbol extends BaseCoincapService {
  static route = { base: 'coincap/symbol', pattern: ':assetId' }

  static examples = [
    {
      title: 'Coincap (Symbol)',
      namedParams: { assetId: 'bitcoin' },
      staticPreview: this.render({ asset: { symbol: 'BTC' } }),
      keywords: ['bitcoin', 'crypto', 'cryptocurrency'],
    },
  ]

  static render({ asset }) {
    return {
      label: asset.name,
      message: asset.symbol,
      color: 'green',
    }
  }

  async handle({ assetId }) {
    const { data: asset } = await this.fetch({ assetId, schema })
    return this.constructor.render({ asset })
  }
}
