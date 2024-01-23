import { renderVersionBadge } from '../version.js'
import { pathParams } from '../index.js'
import { BaseCratesService, description } from './crates-base.js'

export default class CratesVersion extends BaseCratesService {
  static category = 'version'
  static route = { base: 'crates/v', pattern: ':crate' }

  static openApi = {
    '/crates/v/{crate}': {
      get: {
        summary: 'Crates.io Version',
        description,
        parameters: pathParams({
          name: 'crate',
          example: 'rustc-serialize',
        }),
      },
    },
  }

  transform(json) {
    return json.crate.max_stable_version
      ? json.crate.max_stable_version
      : json.crate.max_version
  }

  async handle({ crate }) {
    const json = await this.fetch({ crate })
    const version = this.transform(json)
    return renderVersionBadge({ version })
  }
}
