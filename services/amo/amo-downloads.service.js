'use strict'

const { metric } = require('../../lib/text-formatters')
const { downloadCount } = require('../../lib/color-formatters')
const { redirector } = require('..')
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

const AmoLegacyRedirect = redirector({
  // /d used to be a 'total downloads' badge
  // but the v3 api only gives us weekly downloads now
  // redirect /d to /dw
  category: 'downloads',
  route: {
    base: 'amo/d',
    pattern: ':addonId',
  },
  target: ({ addonId }) => `/amo/dw/${addonId}`,
  dateAdded: new Date('2019-02-23'),
})

module.exports = {
  AmoWeeklyDownloads,
  AmoLegacyRedirect,
}
