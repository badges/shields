import { renderVersionBadge } from '../version.js'
import BaseCpanService from './cpan.js'

export default class CpanVersion extends BaseCpanService {
  static category = 'version'
  static route = { base: 'cpan/v', pattern: ':packageName' }

  static examples = [
    {
      title: 'CPAN',
      namedParams: { packageName: 'Config-Augeas' },
      staticPreview: renderVersionBadge({ version: '1.000' }),
      keywords: ['perl'],
    },
  ]

  async handle({ packageName }) {
    const { version } = await this.fetch({ packageName })
    return renderVersionBadge({ version })
  }
}
