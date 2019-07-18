'use strict'

const OpencollectiveBase = require('./opencollective-base')

module.exports = class OpencollectiveSponsors extends OpencollectiveBase {
  static get route() {
    return this.buildRoute('sponsors')
  }

  static get examples() {
    return [
      {
        title: 'Open Collective sponsors',
        namedParams: { collective: 'shields' },
        staticPreview: this.render(10),
        keywords: ['opencollective'],
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'sponsors',
    }
  }

  async handle({ collective }) {
    const { backersCount } = await this.fetchCollectiveBackersCount(
      collective,
      { userType: 'organizations' }
    )
    return this.constructor.render(backersCount)
  }
}
