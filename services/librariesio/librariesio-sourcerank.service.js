'use strict'

const { colorScale } = require('../../lib/color-formatters')
const LibrariesIoBase = require('./librariesio-base')

const sourceRankColor = colorScale([10, 15, 20, 25, 30])

class LibrariesIoSourcerank extends LibrariesIoBase {
  static get category() {
    return 'rating'
  }

  static get defaultBadgeData() {
    return {
      label: 'sourcerank',
    }
  }

  static get url() {
    return this.buildUrl('librariesio/sourcerank')
  }

  static get examples() {
    return [
      {
        title: 'Libraries.io SourceRank',
        previewUrl: 'npm/got',
      },
    ]
  }

  static render({ rank }) {
    return {
      message: rank,
      color: sourceRankColor(rank),
    }
  }

  async handle({ platform, packageName }) {
    const { rank } = await this.fetch(
      {
        platform,
        packageName,
      },
      { allowPackages: true }
    )
    return this.constructor.render({ rank })
  }
}

module.exports = LibrariesIoSourcerank
