import { renderVersionBadge } from '../version.js'
import { BaseAmoService, keywords } from './amo-base.js'

export default class AmoVersion extends BaseAmoService {
  static category = 'version'
  static route = { base: 'amo/v', pattern: ':addonId' }

  static examples = [
    {
      title: 'Mozilla Add-on',
      namedParams: { addonId: 'dustman' },
      staticPreview: renderVersionBadge({ version: '2.1.0' }),
      keywords,
    },
  ]

  async handle({ addonId }) {
    const data = await this.fetch({ addonId })
    return renderVersionBadge({ version: data.current_version.version })
  }
}
