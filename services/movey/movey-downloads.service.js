import { renderDownloadsBadge } from '../downloads.js'
import { NotFound } from '../../core/base-service/index.js'
import { BaseMoveyService, keywords } from './movey-base.js'

export default class MoveyDownloads extends BaseMoveyService {
  static category = 'downloads'
  static route = {
    base: 'movey',
    pattern: 'd/:moveyPackage/:version?',
  }

  static examples = [
    {
      title: 'Movey.net',
      pattern: 'd/:moveyPackage',
      namedParams: { moveyPackage: 'BasicCoin' },
      staticPreview: this.render({ downloads: 5000000 }),
      keywords,
    },
    {
      title: 'Movey.net (version)',
      pattern: 'd/:moveyPackage/:version',
      namedParams: {
        moveyPackage: 'BasicCoin',
        version: '0.0.1',
      },
      staticPreview: this.render({ downloads: 2000000 }),
      keywords,
    },
  ]

  static render({ downloads, version }) {
    const colorOverride = 'A1C93E'
    let labelOverride = 'Movey.Net'
    if (version) {
      labelOverride = `${labelOverride}@${version}`
    }
    return renderDownloadsBadge({ downloads, colorOverride, labelOverride })
  }

  async handle({ moveyPackage, version }) {
    const json = await this.fetch({ moveyPackage })

    let downloads
    if (version) {
      const ver = json.versions.filter(ver => ver.version === version)[0]
      if (ver) {
        downloads = ver.download_counts
      } else {
        throw new NotFound({ prettyMessage: 'version not found' })
      }
    } else {
      downloads = json.total_download_counts
    }
    return this.constructor.render({ downloads, version })
  }
}
