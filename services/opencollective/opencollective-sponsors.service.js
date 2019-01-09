'use strict'

const OpencollectiveBase = require('./opencollective-base')

module.exports = class OpencollectiveSponsors extends OpencollectiveBase {
  static get examples() {
    return [
      {
        title: 'open collective sponsors',
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

  static get route() {
    return this.buildRoute('sponsors')
  }

  async handle({ collective }) {
    const { backersCount } = await this.fetchCollectiveBackersCount(
      collective,
      { userType: 'organizations' }
    )
    return this.constructor.render(backersCount)
  }
}
