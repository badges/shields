import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { pathParams } from '../index.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  latest_version: Joi.string().required(),
  name: Joi.string().required(),
}).required()

const description =
  '[deno.land/x](https://deno.land/x) is the official third-party module registry for Deno.'

export default class DenoVersion extends BaseJsonService {
  static category = 'version'

  static route = { base: 'deno/v', pattern: ':module' }

  static openApi = {
    '/deno/v/{module}': {
      get: {
        summary: 'deno.land/x Version',
        description,
        parameters: pathParams({
          name: 'module',
          example: 'fresh',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'deno' }

  async handle({ module }) {
    const { latest_version: version } = await this._requestJson({
      schema,
      url: `https://apiland.deno.dev/v2/modules/${module}`,
      httpErrors: { 404: 'module not found' },
    })
    return renderVersionBadge({ version })
  }
}
