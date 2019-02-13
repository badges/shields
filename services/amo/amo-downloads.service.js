'use strict'

const { metric } = require('../../lib/text-formatters')
const { downloadCount } = require('../../lib/color-formatters')

const { BaseAmoService, keywords } = require('./amo-base')

module.exports = class AmoDownloads extends BaseAmoService {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'amo/d',
      pattern: ':addonId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Mozilla Add-on',
        namedParams: { addonId: 'dustman' },
        staticPreview: this.render({ downloads: 12400 }),
        keywords,
      },
    ]
  }

  static render({ downloads }) {
    return {
      message: `${metric(downloads)}`,
      color: downloadCount(downloads),
    }
  }

  async handle({ addonId }) {
    const data = await this.fetch({ addonId })
    return this.constructor.render({
      downloads: data.addon.total_downloads,
    })
  }

  static get defaultBadgeData() {
    return { label: 'downloads' }
  }
}
