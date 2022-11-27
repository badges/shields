import Joi from 'joi'
import BaseCoincapService from './coincap-base.js'

const schema = Joi.object({
  data: Joi.object({
    rank: Joi.string()
      .pattern(/^[0-9]+$/)
      .required(),
    name: Joi.string().required(),
  }).required(),
}).required()

export default class CoincapRank extends BaseCoincapService {
  static route = { base: 'coincap/rank', pattern: ':assetId' }

  static examples = [
    {
      title: 'Coincap (Rank)',
      namedParams: { assetId: 'bitcoin' },
      staticPreview: this.render({ asset: { name: 'bitcoin', rank: '1' } }),
      keywords: ['bitcoin', 'crypto', 'cryptocurrency'],
    },
  ]

  static render({ asset }) {
    return {
      label: `${asset.name}`.toLowerCase(),
      message: asset.rank,
      color: 'blue',
    }
  }

  async handle({ assetId }) {
    const { data: asset } = await this.fetch({ assetId, schema })
    return this.constructor.render({ asset })
  }
}
