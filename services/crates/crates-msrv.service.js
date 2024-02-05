import { NotFound, pathParams } from '../index.js'
import {
  BaseCratesService,
  description as cratesIoDescription,
} from './crates-base.js'

const description = `
${cratesIoDescription}

MSRV is a crate's minimum suppported rust version,
the oldest version of Rust supported by the crate.
See the [Cargo Book](https://doc.rust-lang.org/cargo/reference/manifest.html#the-rust-version-field)
for more info.
`

export default class CratesMSRV extends BaseCratesService {
  static category = 'platform-support'
  static route = {
    base: 'crates/msrv',
    pattern: ':crate/:version?',
  }

  static openApi = {
    '/crates/msrv/{crate}': {
      get: {
        summary: 'Crates.io MSRV',
        description,
        parameters: pathParams({
          name: 'crate',
          example: 'serde',
        }),
      },
    },
    '/crates/msrv/{crate}/{version}': {
      get: {
        summary: 'Crates.io MSRV (version)',
        description,
        parameters: pathParams(
          {
            name: 'crate',
            example: 'serde',
          },
          {
            name: 'version',
            example: '1.0.194',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'msrv', color: 'blue' }

  static transform(response) {
    const msrv = this.getVersionObj(response).rust_version
    if (!msrv) {
      throw new NotFound({ prettyMessage: 'unknown' })
    }

    return { msrv }
  }

  async handle({ crate, version }) {
    const json = await this.fetch({ crate, version })
    const { msrv } = this.constructor.transform(json)
    return { message: msrv }
  }
}
