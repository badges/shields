import Joi from 'joi'
import { renderLicenseBadge } from '../licenses.js'
import { BaseJsonService, pathParams } from '../index.js'

const schema = Joi.object({
  info: Joi.object({ license: Joi.string().required() }).required(),
})

export default class DubLicense extends BaseJsonService {
  static category = 'license'
  static route = { base: 'dub/l', pattern: ':packageName' }
  static openApi = {
    '/dub/l/{packageName}': {
      get: {
        summary: 'DUB License',
        parameters: pathParams({
          name: 'packageName',
          example: 'vibe-d',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'license' }

  async fetch({ packageName }) {
    return this._requestJson({
      schema,
      url: `https://code.dlang.org/api/packages/${packageName}/latest/info`,
    })
  }

  async handle({ packageName }) {
    const data = await this.fetch({ packageName })
    return renderLicenseBadge({ licenses: [data.info.license] })
  }
}
