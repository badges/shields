import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService, pathParams } from '../index.js'

const schema = Joi.object({
  version: Joi.string().required(),
}).required()

export default class Macports extends BaseJsonService {
  static category = 'version'

  static route = {
    base: 'macports/v',
    pattern: ':portName',
  }

  static openApi = {
    '/macports/v/{portName}': {
      get: {
        summary: 'MacPorts Port Version',
        description:
          'Shows the version of a [MacPorts](https://ports.macports.org/) port.',
        parameters: pathParams({
          name: 'portName',
          example: 'git',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'macports',
  }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async fetch({ portName }) {
    return this._requestJson({
      schema,
      url: `https://ports.macports.org/api/v1/ports/${encodeURIComponent(portName)}/`,
    })
  }

  async handle({ portName }) {
    const data = await this.fetch({ portName })
    return this.constructor.render({ version: data.version })
  }
}
