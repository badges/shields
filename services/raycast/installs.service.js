import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { anyInteger } from '../validators.js'
import { BaseJsonService, NotFound, pathParams } from '../index.js'

const schema = Joi.object({
  download_count: anyInteger,
}).required()

export default class RaycastInstalls extends BaseJsonService {
  static category = 'platform-support'

  static route = {
    base: 'raycast/installs',
    pattern: ':user/:extension',
  }

  static openApi = {
    '/raycast/installs/{user}/{extension}': {
      get: {
        summary: 'Raycast extension downloads count',
        parameters: pathParams(
          { name: 'user', example: 'Fatpandac' },
          { name: 'extension', example: 'bilibili' },
        ),
      },
    },
  }

  static _cacheLength = 7200

  static render({ user, extension, downloadCount }) {
    return {
      label: 'Installs',
      message: metric(downloadCount),
      color: 'green',
      link: [`https://www.raycast.com/${user}/${extension}`],
    }
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
    const downloadCount = json.download_count
    if (downloadCount === undefined) {
      throw new NotFound({ prettyMessage: 'download_count not found' })
    }
    return { downloadCount }
  }

  async handle({ user, extension }) {
    const json = await this.fetch({ user, extension })
    const { downloadCount } = this.transform(json)
    return this.constructor.render({
      user,
      extension,
      downloadCount,
    })
  }
}
