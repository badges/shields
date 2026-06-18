import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService, pathParam } from '../index.js'

const schema = Joi.object({
  version: Joi.string().required(),
}).required()

export default class Macports extends BaseJsonService {
  static category = 'version'

  static route = {
    base: 'macports/v',
    pattern: ':packageName',
  }

  static openApi = {
    '/macports/v/{packageName}': {
      get: {
        summary: 'MacPorts Package Version',
        parameters: [
          pathParam({
            name: 'packageName',
            example: 'proxy-audio-device',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = {
    label: 'macports',
  }

  portUrl({ packageName }) {
    return `https://ports.macports.org/api/v1/ports/${encodeURIComponent(packageName)}/`
  }

  async fetch({ packageName }) {
    return this._requestJson({
      schema,
      url: this.portUrl({ packageName }),
    })
  }

  async handle({ packageName }) {
    const data = await this.fetch({ packageName })
    return renderVersionBadge({ version: data.version })
  }
}
