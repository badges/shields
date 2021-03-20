'use strict'

const { metric } = require('../text-formatters')
const { downloadCount } = require('../color-formatters')
const OpenVSXBase = require('./open-vsx-base')

module.exports = class OpenVSXDownloads extends OpenVSXBase {
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
      staticPreview: this.render({ downloads: 29000 }),
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
      staticPreview: this.render({ version: '0.69.0', downloads: 29000 }),
      keywords: this.keywords,
    },
  ]

  static defaultBadgeData = { label: 'downloads' }

  static render({ version, downloads }) {
    return {
      label: version ? `downloads@${version}` : 'downloads',
      message: metric(downloads),
      color: downloadCount(downloads),
    }
  }

  async handle({ namespace, extension, version }) {
    const { version: tag, downloadCount } = await this.fetch({
      namespace,
      extension,
      version,
    })
    return this.constructor.render({
      version: version ? tag : undefined,
      downloads: downloadCount,
    })
  }
}
