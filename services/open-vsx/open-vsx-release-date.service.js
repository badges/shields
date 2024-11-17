import { pathParams } from '../index.js'
import { renderDateBadge } from '../date.js'
import { OpenVSXBase, description } from './open-vsx-base.js'

export default class OpenVSXReleaseDate extends OpenVSXBase {
  static category = 'activity'

  static route = {
    base: 'open-vsx',
    pattern: 'release-date/:namespace/:extension',
  }

  static openApi = {
    '/open-vsx/release-date/{namespace}/{extension}': {
      get: {
        summary: 'Open VSX Release Date',
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

  static defaultBadgeData = { label: 'release date' }

  async handle({ namespace, extension }) {
    const { timestamp } = await this.fetch({ namespace, extension })
    return renderDateBadge(timestamp)
  }
}
