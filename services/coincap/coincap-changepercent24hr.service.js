import Joi from 'joi'
import { pathParams } from '../index.js'
import { floorCount } from '../color-formatters.js'
import { BaseCoincapService, description } from './coincap-base.js'

const schema = Joi.object({
  data: Joi.object({
    changePercent24Hr: Joi.string()
      .pattern(/[0-9]*\.[0-9]+/i)
      .required(),
    name: Joi.string().required(),
  }).required(),
}).required()

export default class CoincapChangePercent24HrUsd extends BaseCoincapService {
  static route = { base: 'coincap/change-percent-24hr', pattern: ':assetId' }

  static openApi = {
    '/coincap/change-percent-24hr/{assetId}': {
      get: {
        summary: 'Coincap (Change Percent 24Hr)',
        description,
        parameters: pathParams({
          name: 'assetId',
          example: 'bitcoin',
        }),
      },
    },
  }

  static percentFormat(changePercent24Hr) {
    return `${parseInt(changePercent24Hr).toFixed(2)}%`
  }

  static render({ asset }) {
    return {
      label: `${asset.name}`.toLowerCase(),
      message: this.percentFormat(asset.changePercent24Hr),
      color: floorCount(asset.changePercent24Hr),
    }
  }

  async handle({ assetId }) {
    const { data: asset } = await this.fetch({ assetId, schema })
    return this.constructor.render({ asset })
  }
}
