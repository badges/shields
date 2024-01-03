import Joi from 'joi'
import { pathParams } from '../index.js'
import { BaseCoincapService, description } from './coincap-base.js'

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

  static openApi = {
    '/coincap/rank/{assetId}': {
      get: {
        summary: 'Coincap (Rank)',
        description,
        parameters: pathParams({
          name: 'assetId',
          example: 'bitcoin',
        }),
      },
    },
  }

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
