import { renderVersionBadge } from '../version.js'
import { BaseMoveyService, keywords } from './movey-base.js'

export default class MoveyVersion extends BaseMoveyService {
  static category = 'version'
  static route = {
    base: 'movey',
    pattern: 'v/:moveyPackage',
  }

  static examples = [
    {
      title: 'Movey.Net',
      namedParams: { moveyPackage: 'BasicCoin' },
      staticPreview: renderVersionBadge({ version: '0.0.1' }),
      keywords,
    },
  ]

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ moveyPackage }) {
    const json = await this.fetch({ moveyPackage })
    const version = json.latest_version
    return this.constructor.render({ version })
  }
}
