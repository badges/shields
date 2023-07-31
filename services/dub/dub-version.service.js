import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService, pathParams } from '../index.js'

const schema = Joi.string().required()

export default class DubVersion extends BaseJsonService {
  static category = 'version'
  static route = { base: 'dub/v', pattern: ':packageName' }
  static openApi = {
    '/dub/v/{packageName}': {
      get: {
        summary: 'DUB Version',
        parameters: pathParams({
          name: 'packageName',
          example: 'vibe-d',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'dub' }

  async fetch({ packageName }) {
    return this._requestJson({
      schema,
      url: `https://code.dlang.org/api/packages/${packageName}/latest`,
    })
  }

  async handle({ packageName }) {
    const version = await this.fetch({ packageName })
    return renderVersionBadge({ version })
  }
}
