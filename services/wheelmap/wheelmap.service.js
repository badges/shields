import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  node: Joi.object({
    wheelchair: Joi.string().required(),
  }).required(),
}).required()

export default class Wheelmap extends BaseJsonService {
  static category = 'other'

  static route = {
    base: 'wheelmap/a',
    pattern: ':nodeId(-?[0-9]+)',
  }

  static auth = {
    passKey: 'wheelmap_token',
    authorizedOrigins: ['https://wheelmap.org'],
    isRequired: true,
  }

  static examples = [
    {
      title: 'Wheelmap',
      namedParams: { nodeId: '26699541' },
      staticPreview: this.render({ accessibility: 'yes' }),
    },
  ]

  static defaultBadgeData = { label: 'accessibility' }

  static render({ accessibility }) {
    let color
    if (accessibility === 'yes') {
      color = 'brightgreen'
    } else if (accessibility === 'limited') {
      color = 'yellow'
    } else if (accessibility === 'no') {
      color = 'red'
    }
    return { message: accessibility, color }
  }

  async fetch({ nodeId }) {
    return this._requestJson(
      this.authHelper.withQueryStringAuth(
        { passKey: 'api_key' },
        {
          schema,
          url: `https://wheelmap.org/api/nodes/${nodeId}`,
          errorMessages: {
            401: 'invalid token',
            404: 'node not found',
          },
        }
      )
    )
  }

  async handle({ nodeId }) {
    const json = await this.fetch({ nodeId })
    const accessibility = json.node.wheelchair
    return this.constructor.render({ accessibility })
  }
}
