'use strict'

const OpencollectiveBase = require('./opencollective-base')

module.exports = class OpencollectiveAll extends OpencollectiveBase {
  static get route() {
    return this.buildRoute('all')
  }

  static get examples() {
    return [
      {
        title: 'Open Collective backers and sponsors',
        namedParams: { collective: 'shields' },
        staticPreview: this.render(35),
        keywords: ['opencollective'],
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'backers and sponsors',
    }
  }

  async handle({ collective }) {
    const { backersCount } = await this.fetchCollectiveInfo(collective)
    return this.constructor.render(backersCount)
  }
}
