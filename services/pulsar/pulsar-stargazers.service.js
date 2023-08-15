import Joi from 'joi'
import { BaseJsonService } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { pulsarPurple } from './pulsar-helper.js'

const schema = Joi.object({
  stargazers_count: nonNegativeInteger,
})

export default class PulsarStargazers extends BaseJsonService {
  static category = 'rating'

  static route = { base: 'pulsar/stargazers', pattern: ':packageName' }

  static examples = [
    {
      title: 'Pulsar Stargazers',
      namedParams: { packageName: 'hey-pane' },
      staticPreview: this.render({ stargazerCount: 1000 }),
    },
  ]

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
