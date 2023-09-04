import Joi from 'joi'
import { renderVersionBadge } from '..//version.js'
import { BaseJsonService, pathParams } from '../index.js'
const schema = Joi.object({
  latest_version: Joi.string().required(),
}).required()

export default class SpackVersion extends BaseJsonService {
  static category = 'version'

  static route = {
    base: 'spack/v',
    pattern: ':packageName',
  }

  static openApi = {
    '/spack/v/{packageName}': {
      get: {
        summary: 'Spack',
        parameters: pathParams({
          name: 'packageName',
          example: 'adios2',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'spack' }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async fetch({ packageName }) {
    return this._requestJson({
      schema,
      url: `https://packages.spack.io/data/packages/${packageName}.json`,
      httpErrors: {
        404: 'package not found',
      },
    })
  }

  async handle({ packageName }) {
    const pkg = await this.fetch({ packageName })
    return this.constructor.render({ version: pkg.latest_version })
  }
}
