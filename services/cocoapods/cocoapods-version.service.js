import { renderVersionBadge } from '../version.js'
import BaseCocoaPodsService from './cocoapods-base.js'

export default class CocoapodsVersion extends BaseCocoaPodsService {
  static category = 'version'
  static route = { base: 'cocoapods/v', pattern: ':spec' }

  static examples = [
    {
      title: 'Cocoapods',
      namedParams: { spec: 'AFNetworking' },
      staticPreview: renderVersionBadge({ version: 'v3.2.1' }),
    },
  ]

  static defaultBadgeData = { label: 'pod' }

  async handle({ spec }) {
    const { version } = await this.fetch({ spec })
    return renderVersionBadge({ version })
  }
}
