import { renderVersionBadge } from '../version.js'
import { InvalidResponse } from '../index.js'
import { BaseCratesService, keywords } from './crates-base.js'

export default class CratesVersion extends BaseCratesService {
  static category = 'version'
  static route = { base: 'crates/v', pattern: ':crate' }

  static examples = [
    {
      title: 'Crates.io',
      namedParams: { crate: 'rustc-serialize' },
      staticPreview: renderVersionBadge({ version: '0.3.24' }),
      keywords,
    },
  ]

  transform(json) {
    if (json.errors) {
      throw new InvalidResponse({ prettyMessage: json.errors[0].detail })
    }
    return { version: json.version ? json.version.num : json.crate.max_version }
  }

  async handle({ crate }) {
    const json = await this.fetch({ crate })
    const { version } = this.transform(json)
    return renderVersionBadge({ version })
  }
}
