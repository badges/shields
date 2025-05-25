import { pathParams } from '../index.js'
import { BaseDepsRsService, description } from './deps-rs-base.js'

export default class DepsRsCrate extends BaseDepsRsService {
  static category = 'dependencies'
  static route = { base: 'deps-rs', pattern: ':crate/:version' }

  static openApi = {
    '/deps-rs/{crate}/{version}': {
      get: {
        summary: 'Deps.rs Crate Dependencies',
        description,
        parameters: pathParams(
          {
            name: 'crate',
            example: 'syn',
            description: 'The name of the Rust crate',
          },
          {
            name: 'version',
            example: 'latest',
            description: 'Version number or "latest"',
            schema: {
              type: 'string',
              examples: ['latest', '2.0.101', '1.0.0'],
            },
          },
        ),
      },
    },
  }

  async handle({ crate, version }) {
    const json = await this.fetchCrate({ crate, version })
    return {
      label: json.label,
      message: json.message,
      color: json.color,
    }
  }
}
