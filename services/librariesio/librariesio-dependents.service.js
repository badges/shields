import { pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import LibrariesIoBase from './librariesio-base.js'

// https://libraries.io/api#project-dependents
export default class LibrariesIoDependents extends LibrariesIoBase {
  static category = 'other'

  static route = {
    base: 'librariesio/dependents',
    pattern: ':platform/:scope(@[^/]+)?/:packageName',
  }

  static openApi = {
    '/librariesio/dependents/{platform}/{packageName}': {
      get: {
        summary: 'Dependents (via libraries.io)',
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
    '/librariesio/dependents/{platform}/{scope}/{packageName}': {
      get: {
        summary: 'Dependents (via libraries.io), scoped npm package',
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
    label: 'dependents',
  }

  static render({ dependentCount }) {
    return {
      message: metric(dependentCount),
      color: dependentCount === 0 ? 'orange' : 'brightgreen',
    }
  }

  async handle({ platform, scope, packageName }) {
    const { dependents_count: dependentCount } = await this.fetchProject({
      platform,
      scope,
      packageName,
    })
    return this.constructor.render({ dependentCount })
  }
}
