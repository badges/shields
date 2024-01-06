import { pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import LibrariesIoBase from './librariesio-base.js'

// https://libraries.io/api#project-dependent-repositories
export default class LibrariesIoDependentRepos extends LibrariesIoBase {
  static category = 'other'

  static route = {
    base: 'librariesio/dependent-repos',
    pattern: ':platform/:scope(@[^/]+)?/:packageName',
  }

  static openApi = {
    '/librariesio/dependent-repos/{platform}/{packageName}': {
      get: {
        summary: 'Dependent repos (via libraries.io)',
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
    '/librariesio/dependent-repos/{platform}/{scope}/{packageName}': {
      get: {
        summary: 'Dependent repos (via libraries.io), scoped npm package',
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

  static _cacheLength = 900

  static defaultBadgeData = {
    label: 'dependent repos',
  }

  static render({ dependentReposCount }) {
    return {
      message: metric(dependentReposCount),
      color: dependentReposCount === 0 ? 'orange' : 'brightgreen',
    }
  }

  async handle({ platform, scope, packageName }) {
    const { dependent_repos_count: dependentReposCount } =
      await this.fetchProject({
        platform,
        scope,
        packageName,
      })
    return this.constructor.render({ dependentReposCount })
  }
}
