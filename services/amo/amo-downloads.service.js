'use strict'

const { metric } = require('../../lib/text-formatters')
const { downloadCount } = require('../../lib/color-formatters')
const { deprecatedService } = require('..')
const { BaseAmoService, keywords } = require('./amo-base')

class AmoWeeklyDownloads extends BaseAmoService {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'amo/dw',
      pattern: ':addonId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Mozilla Add-on',
        namedParams: { addonId: 'dustman' },
        staticPreview: this.render({ downloads: 120 }),
        keywords,
      },
    ]
  }

  static render({ downloads }) {
    return {
      message: `${metric(downloads)}/week`,
      color: downloadCount(downloads),
    }
  }

  async handle({ addonId }) {
    const data = await this.fetch({ addonId })
    return this.constructor.render({
      downloads: data.weekly_downloads,
    })
  }

  static get defaultBadgeData() {
    return { label: 'downloads' }
  }
}

const AmoTotalDownloads = deprecatedService({
  category: 'downloads',
  route: {
    base: 'amo/d',
    pattern: ':addonId',
  },
  label: 'downloads',
  dateAdded: new Date('2019-02-23'),
})

module.exports = {
  AmoWeeklyDownloads,
  AmoTotalDownloads,
}
