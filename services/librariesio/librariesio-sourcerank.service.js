import { pathParams } from '../index.js'
import { colorScale } from '../color-formatters.js'
import LibrariesIoBase from './librariesio-base.js'

const sourceRankColor = colorScale([10, 15, 20, 25, 30])

export default class LibrariesIoSourcerank extends LibrariesIoBase {
  static category = 'rating'

  static route = {
    base: 'librariesio/sourcerank',
    pattern: ':platform/:scope(@[^/]+)?/:packageName',
  }

  static openApi = {
    '/librariesio/sourcerank/{platform}/{packageName}': {
      get: {
        summary: 'Libraries.io SourceRank',
        parameters: pathParams(
          {
            name: 'platform',
            example: 'npm',
          },
          {
            name: 'packageName',
            example: 'got',
          },
        ),
      },
    },
    '/librariesio/sourcerank/{platform}/{scope}/{packageName}': {
      get: {
        summary: 'Libraries.io SourceRank, scoped npm package',
        parameters: pathParams(
          {
            name: 'platform',
            example: 'npm',
          },
          {
            name: 'scope',
            example: '@babel',
          },
          {
            name: 'packageName',
            example: 'core',
          },
        ),
      },
    },
  }

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
    const { rank } = await this.fetchProject({
      platform,
      scope,
      packageName,
    })
    return this.constructor.render({ rank })
  }
}
