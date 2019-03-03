'use strict'

const prettyBytes = require('pretty-bytes')
const BaseMicrobadgerService = require('./microbadger-base')

module.exports = class MicrobadgerSize extends BaseMicrobadgerService {
  static get route() {
    return {
      base: 'microbadger/image-size',
      pattern: ':user/:repo/:tag*',
    }
  }

  static get defaultBadgeData() {
    return { label: 'image size' }
  }

  static get examples() {
    return [
      {
        title: 'MicroBadger Size',
        pattern: 'image-size/:imageId+',
        namedParams: { imageId: 'fedora/apache' },
        staticPreview: this.render({ size: 126000000 }),
        keywords: ['docker'],
      },
      {
        title: 'MicroBadger Size (tag)',
        pattern: 'image-size/:imageId+/:tag',
        namedParams: { imageId: 'fedora/apache', tag: 'latest' },
        staticPreview: this.render({ size: 103000000 }),
        keywords: ['docker'],
      },
    ]
  }

  static render({ size }) {
    return {
      message: prettyBytes(parseInt(size)),
      color: 'blue',
    }
  }

  async handle({ user, repo, tag }) {
    const data = await this.fetch({ user, repo })
    const image = this.constructor.getImage(data, tag)
    return this.constructor.render({ size: image.DownloadSize })
  }
}
