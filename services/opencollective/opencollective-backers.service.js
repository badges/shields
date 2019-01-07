'use strict'

const OpencollectiveBase = require('./opencollective-base')

module.exports = class OpencollectiveBackers extends OpencollectiveBase {
  static get examples() {
    return [
      {
        title: 'open collective backers',
        namedParams: { collective: 'shields' },
        staticPreview: this.render(25),
        keywords: ['opencollective'],
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'backers',
    }
  }

  static get route() {
    return this.buildRoute('backers')
  }

  async handle({ collective }) {
    const { backersCount } = await this.fetchCollectiveBackersCount(
      collective,
      { userType: 'users' }
    )
    return this.constructor.render(backersCount)
  }
}
