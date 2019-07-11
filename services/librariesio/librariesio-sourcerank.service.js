'use strict'

const { colorScale } = require('../color-formatters')
const { fetchProject } = require('./librariesio-common')
const { BaseJsonService } = require('..')

const sourceRankColor = colorScale([10, 15, 20, 25, 30])

module.exports = class LibrariesIoSourcerank extends BaseJsonService {
  static get category() {
    return 'rating'
  }

  static get route() {
    return {
      base: 'librariesio/sourcerank',
      pattern: ':platform/:packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'Libraries.io SourceRank',
        namedParams: {
          platform: 'npm',
          packageName: 'got',
        },
        staticPreview: this.render({ rank: 25 }),
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'sourcerank',
    }
  }

  static render({ rank }) {
    return {
      message: rank,
      color: sourceRankColor(rank),
    }
  }

  async handle({ platform, packageName }) {
    const { rank } = await fetchProject(this, {
      platform,
      packageName,
    })
    return this.constructor.render({ rank })
  }
}
