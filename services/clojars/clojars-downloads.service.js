'use strict'

const { metric } = require('../text-formatters')
const { downloadCount: downloadsColor } = require('../color-formatters')
const { BaseClojarsService } = require('./clojars-base')

module.exports = class ClojarsDownloads extends BaseClojarsService {
  static render({ downloads }) {
    return {
      label: 'downloads',
      message: metric(downloads),
      color: downloadsColor(downloads),
    }
  }

  async handle({ clojar }) {
    const json = await this.fetch({ clojar })
    return this.constructor.render({ downloads: json.downloads })
  }

  static get defaultBadgeData() {
    return { label: 'downloads' }
  }

  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'clojars/dt',
      pattern: ':clojar+',
    }
  }

  static get examples() {
    return [
      {
        namedParams: { clojar: 'prismic' },
        staticPreview: this.render({ downloads: 117 }),
      },
    ]
  }
}
