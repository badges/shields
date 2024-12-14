import Joi from 'joi'
import { BaseJsonService, pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { baseDescription } from './pub-common.js'

const description = `${baseDescription}
  <p>This badge shows a measure of how many developers have downloaded a package. This provides a raw measure of the overall sentiment of a package from peer developers.</p>`

const schema = Joi.object({
  downloadCount30Days: nonNegativeInteger,
}).required()

export default class PubDownloads extends BaseJsonService {
  static category = 'downloads'

  static route = { base: 'pub/downloads', pattern: ':packageName' }

  static openApi = {
    '/pub/downloads/{packageName}': {
      get: {
        summary: 'Pub Downloads',
        description,
        parameters: pathParams({
          name: 'packageName',
          example: 'analysis_options',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'downloads' }

  static render({ downloadCount30Days }) {
    return {
      label: 'downloads',
      message: metric(downloadCount30Days),
      color: 'blue',
    }
  }

  async fetch({ packageName }) {
    return this._requestJson({
      schema,
      url: `https://pub.dev/api/packages/${packageName}/score`,
    })
  }

  async handle({ packageName }) {
    const score = await this.fetch({ packageName })
    const downloadCount30Days = score.downloadCount30Days
    return this.constructor.render({ downloadCount30Days })
  }
}
