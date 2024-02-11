import { InvalidResponse, pathParams } from '../index.js'
import { BaseCratesService, description } from './crates-base.js'

export default class CratesLicense extends BaseCratesService {
  static category = 'license'
  static route = { base: 'crates/l', pattern: ':crate/:version?' }

  static openApi = {
    '/crates/l/{crate}': {
      get: {
        summary: 'Crates.io License',
        description,
        parameters: pathParams({
          name: 'crate',
          example: 'rustc-serialize',
        }),
      },
    },
    '/crates/l/{crate}/{version}': {
      get: {
        summary: 'Crates.io License (version)',
        description,
        parameters: pathParams(
          {
            name: 'crate',
            example: 'rustc-serialize',
          },
          {
            name: 'version',
            example: '0.3.24',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'license', color: 'blue' }

  static transform(response) {
    const license = this.getVersionObj(response).license
    if (!license) {
      throw new InvalidResponse({ prettyMessage: 'invalid null license' })
    }

    return { license }
  }

  async handle({ crate, version }) {
    const json = await this.fetch({ crate, version })
    const { license } = this.constructor.transform(json)
    return { message: license }
  }
}
