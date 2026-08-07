import Joi from 'joi'
import { BaseJsonService, pathParam } from '../index.js'

const statusSchema = Joi.string().valid(
  'operational',
  'degraded',
  'partial_outage',
  'major_outage',
  'maintenance',
  'unknown',
)

const schema = Joi.object({
  data: Joi.object({
    currentStatus: Joi.object({
      code: statusSchema.required(),
    }).required(),
  }).required(),
}).required()

const statusColors = {
  operational: 'brightgreen',
  degraded: 'yellow',
  partial_outage: 'orange',
  major_outage: 'red',
  maintenance: 'blue',
  unknown: 'lightgrey',
}

export default class OutageDeckStatus extends BaseJsonService {
  static category = 'monitoring'

  static route = {
    base: 'outagedeck/status',
    pattern: ':provider',
  }

  static openApi = {
    '/outagedeck/status/{provider}': {
      get: {
        summary: 'OutageDeck provider status',
        description:
          'Current provider status from the [OutageDeck public API](https://outagedeck.com/developers/api?utm_source=shields&utm_medium=service&utm_campaign=shields_provider_status).',
        parameters: [
          pathParam({
            name: 'provider',
            example: 'github',
            description: 'The OutageDeck provider slug',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = {
    label: 'status',
  }

  static render({ status }) {
    return {
      message: status.replaceAll('_', ' '),
      color: statusColors[status],
    }
  }

  async fetch({ provider }) {
    return this._requestJson({
      schema,
      url: `https://outagedeck.com/api/v1/providers/${encodeURIComponent(provider)}`,
    })
  }

  async handle({ provider }) {
    const response = await this.fetch({ provider })
    return this.constructor.render({ status: response.data.currentStatus.code })
  }
}
