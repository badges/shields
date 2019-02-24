'use strict'

const { metric } = require('../../lib/text-formatters')
const { downloadCount } = require('../../lib/color-formatters')
const { redirector } = require('..')
const { BaseAmoService, keywords } = require('./amo-base')

const documentation = `
<p>
  Previously <code>amo/d</code> provided a &ldquo;total downloads&rdquo; badge. However,
  <a href="https://github.com/badges/shields/issues/3079">updates to the v3 API</a> only
  give us weekly downloads. The route <code>amo/d</code> redirects to <code>amo/dw</code>.
</p>
`

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
        documentation,
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
