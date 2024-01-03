import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, pathParams } from '../index.js'
import { renderDownloadsBadge } from '../downloads.js'

const schema = Joi.object({
  download_count: nonNegativeInteger,
}).required()

export default class RaycastInstalls extends BaseJsonService {
  static category = 'downloads'

  static route = {
    base: 'raycast/dt',
    pattern: ':user/:extension',
  }

  static openApi = {
    '/raycast/dt/{user}/{extension}': {
      get: {
        summary: 'Raycast extension downloads count',
        parameters: pathParams(
          { name: 'user', example: 'Fatpandac' },
          { name: 'extension', example: 'bilibili' },
        ),
      },
    },
  }

  static render({ downloads }) {
    return renderDownloadsBadge({ downloads })
  }

  async fetch({ user, extension }) {
    return this._requestJson({
      schema,
      url: `https://www.raycast.com/api/v1/extensions/${user}/${extension}`,
      httpErrors: {
        404: 'user/extension not found',
      },
    })
  }

  transform(json) {
    const downloads = json.download_count

    return { downloads }
  }

  async handle({ user, extension }) {
    const json = await this.fetch({ user, extension })
    const { downloads } = this.transform(json)
    return this.constructor.render({ downloads })
  }
}
