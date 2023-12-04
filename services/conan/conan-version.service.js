import { pathParams } from '../index.js'
import { renderVersionBadge } from '../version.js'
import { ConditionalGithubAuthV3Service } from '../github/github-auth-service.js'
import { fetchRepoContent } from '../github/github-common-fetch.js'
import { parseLatestVersionFromConfig } from './conan-version-helpers.js'

export default class ConanVersion extends ConditionalGithubAuthV3Service {
  static category = 'version'

  static route = { base: 'conan/v', pattern: ':packageName' }

  static openApi = {
    '/conan/v/{packageName}': {
      get: {
        summary: 'Conan Center',
        description: '[Conan](https://conan.io/) is a package manager for C++',
        parameters: pathParams({
          name: 'packageName',
          example: 'boost',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'conan' }

  async handle({ packageName }) {
    const configContent = await fetchRepoContent(this, {
      user: 'conan-io',
      repo: 'conan-center-index',
      branch: 'master',
      filename: `recipes/${packageName}/config.yml`,
    })

    const version = parseLatestVersionFromConfig(configContent)

    return renderVersionBadge({ version })
  }
}
