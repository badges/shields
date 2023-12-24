import Joi from 'joi'
import { BaseJsonService, pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { pulsarPurple } from './pulsar-helper.js'

const schema = Joi.object({
  downloads: nonNegativeInteger,
})

export default class PulsarDownloads extends BaseJsonService {
  static category = 'downloads'

  static route = { base: 'pulsar/dt', pattern: ':packageName' }

  static openApi = {
    '/pulsar/dt/{packageName}': {
      get: {
        summary: 'Pulsar Downloads',
        parameters: pathParams({
          name: 'packageName',
          example: 'hey-pane',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'downloads' }

  static render({ downloadCount }) {
    return {
      label: 'downloads',
      message: metric(downloadCount),
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
    const downloadCount = packageData.downloads
    return this.constructor.render({ downloadCount })
  }
}
