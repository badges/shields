import Joi from 'joi'
import { BaseJsonService, pathParams } from '../index.js'
import { isReuseCompliance, COLOR_MAP } from './reuse-compliance-helper.js'

const responseSchema = Joi.object({
  status: isReuseCompliance,
}).required()

export default class Reuse extends BaseJsonService {
  static category = 'license'

  static route = {
    base: 'reuse/compliance',
    pattern: ':remote+',
  }

  static openApi = {
    '/reuse/compliance/{remote}': {
      get: {
        summary: 'REUSE Compliance',
        parameters: pathParams({
          name: 'remote',
          example: 'github.com/fsfe/reuse-tool',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'reuse',
  }

  static render({ status }) {
    return {
      label: 'reuse',
      message: status,
      color: COLOR_MAP[status],
    }
  }

  async fetch({ remote }) {
    return await this._requestJson({
      schema: responseSchema,
      url: `https://api.reuse.software/status/${remote}`,
      httpErrors: {
        400: 'Not a Git repository',
      },
    })
  }

  async handle({ remote }) {
    const { status } = await this.fetch({ remote })
    return this.constructor.render({ status })
  }
}
