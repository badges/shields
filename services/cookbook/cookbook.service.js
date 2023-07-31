import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService, pathParams } from '../index.js'

const schema = Joi.object({ version: Joi.string().required() }).required()

export default class Cookbook extends BaseJsonService {
  static category = 'version'
  static route = { base: 'cookbook/v', pattern: ':cookbook' }

  static openApi = {
    '/cookbook/v/{cookbook}': {
      get: {
        summary: 'Chef cookbook',
        parameters: pathParams({
          name: 'cookbook',
          example: 'chef-sugar',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'cookbook' }

  async fetch({ cookbook }) {
    const url = `https://supermarket.getchef.com/api/v1/cookbooks/${cookbook}/versions/latest`
    return this._requestJson({ schema, url })
  }

  async handle({ cookbook }) {
    const { version } = await this.fetch({ cookbook })
    return renderVersionBadge({ version })
  }
}
