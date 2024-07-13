import { pathParams } from '../index.js'
import { renderDownloadsBadge } from '../downloads.js'
import { OpenVSXBase, description } from './open-vsx-base.js'

export default class OpenVSXDownloads extends OpenVSXBase {
  static category = 'downloads'

  static route = {
    base: 'open-vsx',
    pattern: ':interval(dt)/:namespace/:extension/:version*',
  }

  static openApi = {
    '/open-vsx/dt/{namespace}/{extension}': {
      get: {
        summary: 'Open VSX Downloads',
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
    '/open-vsx/dt/{namespace}/{extension}/{version}': {
      get: {
        summary: 'Open VSX Downloads (version)',
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
          {
            name: 'version',
            example: '0.69.0',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'downloads' }

  async handle({ namespace, extension, version }) {
    const { version: tag, downloadCount: downloads } = await this.fetch({
      namespace,
      extension,
      version,
    })
    return renderDownloadsBadge({
      downloads,
      version: version ? tag : undefined,
    })
  }
}
