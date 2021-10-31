import { renderDownloadsBadge } from '../downloads.js'
import OpenVSXBase from './open-vsx-base.js'

export default class OpenVSXDownloads extends OpenVSXBase {
  static category = 'downloads'

  static route = {
    base: 'open-vsx',
    pattern: ':interval(dt)/:namespace/:extension/:version*',
  }

  static examples = [
    {
      title: 'Open VSX Downloads',
      pattern: 'dt/:namespace/:extension',
      namedParams: {
        namespace: 'redhat',
        extension: 'java',
      },
      staticPreview: renderDownloadsBadge({ downloads: 29000 }),
      keywords: this.keywords,
    },
    {
      title: 'Open VSX Downloads (version)',
      pattern: 'dt/:namespace/:extension/:version',
      namedParams: {
        namespace: 'redhat',
        extension: 'java',
        version: '0.69.0',
      },
      staticPreview: renderDownloadsBadge({
        version: '0.69.0',
        downloads: 29000,
      }),
      keywords: this.keywords,
    },
  ]

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
