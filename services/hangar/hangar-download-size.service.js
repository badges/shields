import prettyBytes from 'pretty-bytes'
import { BaseHangarService, documentation } from './hangar-base.js'

export default class HangarDownloadSize extends BaseHangarService {
  static category = 'size'

  static route = {
    base: 'hangar/download-size',
    pattern: ':author/:slug/:platform',
  }

  static examples = [
    {
      title: 'Hangar Download Size',
      namedParams: { author: 'jmp', slug: 'MiniMOTD', platform: 'PAPER' },
      // This number has no significance.
      staticPreview: this.render({ size: 9093900003 }),
      documentation,
    },
  ]

  static defaultBadgeData = {
    label: 'size',
    color: 'blue',
  }

  static render({ size }) {
    // 1.2kB is ugly, 1.2 KB is pretty.
    const prettySize = prettyBytes(size).toUpperCase()
    return {
      message: prettySize,
    }
  }

  async handle({ author, slug, platform }) {
    const project = `${author}/${slug}`
    const { 0: latestVersion } = (await this.fetchVersions({ project })).result
    const downloadsForPlatform = latestVersion.downloads[platform]
    if (!downloadsForPlatform.fileInfo) {
      return {
        message: 'resource hosted externally',
        color: 'lightgrey',
      }
    }
    return this.constructor.render({
      size: downloadsForPlatform.fileInfo.sizeBytes,
    })
  }
}
