'use strict'

const prettyBytes = require('pretty-bytes')
const BaseMicrobadgerService = require('./microbadger-base')
const { NotFound } = require('..')

module.exports = class MicrobadgerSize extends BaseMicrobadgerService {
  static get route() {
    return {
      base: 'microbadger/image-size',
      pattern: ':user/:repo/:tag*',
    }
  }

  static get examples() {
    return [
      {
        title: 'MicroBadger Size',
        pattern: ':user/:repo',
        namedParams: { user: 'fedora', repo: 'apache' },
        staticPreview: this.render({ size: 126000000 }),
        keywords: ['docker'],
      },
      {
        title: 'MicroBadger Size (tag)',
        pattern: ':user/:repo/:tag',
        namedParams: { user: 'fedora', repo: 'apache', tag: 'latest' },
        staticPreview: this.render({ size: 103000000 }),
        keywords: ['docker'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'image size' }
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
    if (image.DownloadSize === undefined) {
      throw new NotFound({ prettyMessage: 'unknown' })
    }
    return this.constructor.render({ size: image.DownloadSize })
  }
}
