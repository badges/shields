import { pathParams } from '../index.js'
import { renderVersionBadge } from '../version.js'
import { OpenVSXBase, description } from './open-vsx-base.js'

export default class OpenVSXVersion extends OpenVSXBase {
  static category = 'version'

  static route = {
    base: 'open-vsx',
    pattern: 'v/:namespace/:extension',
  }

  static openApi = {
    '/open-vsx/v/{namespace}/{extension}': {
      get: {
        summary: 'Open VSX Version',
        description,
        parameters: pathParams(
          {
            name: 'namespace',
            example: 'redhat',
          },
          {
            name: 'extension',
            example: 'java',
          },
        ),
      },
    },
  }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ namespace, extension }) {
    const { version } = await this.fetch({ namespace, extension })
    return this.constructor.render({ version })
  }
}
