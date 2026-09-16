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

  static _cacheLength = 3600 // We're hitting the API more frequently than requested by upstream maintainers (see https://github.com/badges/shields/issues/11879).

  async handle({ crate }) {
    const json = await this.fetch({ crate })
    const version = this.constructor.getLatestVersion(json)
    return renderVersionBadge({ version })
  }
}
