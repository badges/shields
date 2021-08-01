import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({ version: Joi.string().required() }).required()

export default class Cookbook extends BaseJsonService {
  static category = 'version'
  static route = { base: 'cookbook/v', pattern: ':cookbook' }

  static examples = [
    {
      title: 'Chef cookbook',
      namedParams: { cookbook: 'chef-sugar' },
      staticPreview: renderVersionBadge({ version: '5.0.0' }),
    },
  ]

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
