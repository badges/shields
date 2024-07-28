import prettyBytes from 'pretty-bytes'
import { pathParams } from '../index.js'
import { BaseCratesService, description } from './crates-base.js'

export default class CratesSize extends BaseCratesService {
  static category = 'size'
  static route = {
    base: 'crates/size',
    pattern: ':crate/:version?',
  }

  static openApi = {
    '/crates/size/{crate}': {
      get: {
        summary: 'Crates.io Size',
        description,
        parameters: pathParams({
          name: 'crate',
          example: 'rustc-serialize',
        }),
      },
    },
    '/crates/size/{crate}/{version}': {
      get: {
        summary: 'Crates.io Size (version)',
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

  render({ size }) {
    return {
      label: 'size',
      message: size ? prettyBytes(size) : 'unknown',
      color: size ? 'blue' : 'lightgray',
    }
  }

  async handle({ crate, version }) {
    const json = await this.fetch({ crate, version })

    const size = this.constructor.getVersionObj(json).crate_size

    return this.render({ size })
  }
}
