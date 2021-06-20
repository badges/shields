import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.string().required()

export default class DubVersion extends BaseJsonService {
  static category = 'version'
  static route = { base: 'dub/v', pattern: ':packageName' }
  static examples = [
    {
      title: 'DUB',
      namedParams: { packageName: 'vibe-d' },
      staticPreview: renderVersionBadge({ version: 'v0.8.4' }),
    },
  ]

  static defaultBadgeData = { label: 'dub' }

  async fetch({ packageName }) {
    return this._requestJson({
      schema,
      url: `https://code.dlang.org/api/packages/${packageName}/latest`,
    })
  }

  async handle({ packageName }) {
    const version = await this.fetch({ packageName })
    return renderVersionBadge({ version })
  }
}
