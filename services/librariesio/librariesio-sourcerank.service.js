'use strict'

const { colorScale } = require('../color-formatters')
const { BaseJsonService } = require('..')
const { fetchProject } = require('./librariesio-common')

const sourceRankColor = colorScale([10, 15, 20, 25, 30])

module.exports = class LibrariesIoSourcerank extends BaseJsonService {
  static category = 'rating'

  static route = {
    base: 'librariesio/sourcerank',
    pattern: ':platform/:scope(@[^/]+)?/:packageName',
  }

  static examples = [
    {
      title: 'Libraries.io SourceRank',
      pattern: ':platform/:packageName',
      namedParams: {
        platform: 'npm',
        packageName: 'got',
      },
      staticPreview: this.render({ rank: 25 }),
    },
    {
      title: 'Libraries.io SourceRank, scoped npm package',
      pattern: ':platform/:scope/:packageName',
      namedParams: {
        platform: 'npm',
        scope: '@babel',
        packageName: 'core',
      },
      staticPreview: this.render({ rank: 3 }),
    },
  ]

  static defaultBadgeData = {
    label: 'sourcerank',
  }

  static render({ rank }) {
    return {
      message: rank,
      color: sourceRankColor(rank),
    }
  }

  async handle({ platform, scope, packageName }) {
    const { rank } = await fetchProject(this, {
      platform,
      scope,
      packageName,
    })
    return this.constructor.render({ rank })
  }
}
