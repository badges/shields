'use strict'

const OpencollectiveBase = require('./opencollective-base')

module.exports = class OpencollectiveSponsors extends OpencollectiveBase {
  static route = this.buildRoute('sponsors')

  static examples = [
    {
      title: 'Open Collective sponsors',
      namedParams: { collective: 'shields' },
      staticPreview: this.render(10),
      keywords: ['opencollective'],
    },
  ]

  static defaultBadgeData = {
    label: 'sponsors',
  }

  async handle({ collective }) {
    const { backersCount } = await this.fetchCollectiveBackersCount(
      collective,
      { userType: 'organizations' }
    )
    return this.constructor.render(backersCount)
  }
}
