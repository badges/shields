import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService, pathParams } from '../index.js'

const schema = Joi.object({
  version: Joi.string().required(),
}).required()

export default class MacportsVersion extends BaseJsonService {
  static category = 'version'

  static route = {
    base: 'macports/v',
    pattern: ':portName',
  }

  static openApi = {
    '/macports/v/{portName}': {
      get: {
        summary: 'MacPorts Version',
        parameters: pathParams({
          name: 'portName',
          example: 'git',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'macports' }

  async fetch({ portName }) {
    return this._requestJson({
      schema,
      url: `https://ports.macports.org/api/v1/ports/${portName}/`,
      httpErrors: { 404: 'port not found' },
    })
  }

  async handle({ portName }) {
    const { version } = await this.fetch({ portName })
    return renderVersionBadge({ version })
  }
}
