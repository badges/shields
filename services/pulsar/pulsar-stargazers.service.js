import Joi from 'joi'
import { BaseJsonService, pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { pulsarPurple } from './pulsar-helper.js'

const schema = Joi.object({
  stargazers_count: nonNegativeInteger,
})

export default class PulsarStargazers extends BaseJsonService {
  static category = 'rating'

  static route = { base: 'pulsar/stargazers', pattern: ':packageName' }

  static openApi = {
    '/pulsar/stargazers/{packageName}': {
      get: {
        summary: 'Pulsar Stargazers',
        parameters: pathParams({
          name: 'packageName',
          example: 'hey-pane',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'stargazers' }

  static render({ stargazerCount }) {
    return {
      label: 'stargazers',
      message: metric(stargazerCount),
      color: pulsarPurple,
    }
  }

  async fetch({ packageName }) {
    return this._requestJson({
      schema,
      url: `https://api.pulsar-edit.dev/api/packages/${packageName}`,
      httpErrors: { 404: 'package not found' },
    })
  }

  async handle({ packageName }) {
    const packageData = await this.fetch({ packageName })
    const stargazerCount = packageData.stargazers_count
    return this.constructor.render({ stargazerCount })
  }
}
