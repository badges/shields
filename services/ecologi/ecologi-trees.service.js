import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { floorCount } from '../color-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, pathParams } from '../index.js'

const apiSchema = Joi.object({
  total: nonNegativeInteger,
}).required()

export default class EcologiTrees extends BaseJsonService {
  static category = 'other'
  static route = { base: 'ecologi/trees', pattern: ':username' }
  static openApi = {
    '/ecologi/trees/{username}': {
      get: {
        summary: 'Ecologi (Trees)',
        parameters: pathParams({
          name: 'username',
          example: 'ecologi',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'trees' }

  static render({ count }) {
    return { message: metric(count), color: floorCount(count, 10, 50, 100) }
  }

  async fetch({ username }) {
    const url = `https://public.ecologi.com/users/${username}/trees`
    return this._requestJson({
      url,
      schema: apiSchema,
      httpErrors: {
        404: 'username not found',
      },
    })
  }

  async handle({ username }) {
    const { total } = await this.fetch({ username })

    return this.constructor.render({ count: total })
  }
}
