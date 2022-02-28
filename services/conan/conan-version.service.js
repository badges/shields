import { renderVersionBadge } from '../version.js'
import { ConditionalGithubAuthV3Service } from '../github/github-auth-service.js'
import { fetchRepoContent } from '../github/github-common-fetch.js'
import { parseLatestVersionFromConfig } from './conan-version-helpers.js'

export default class ConanVersion extends ConditionalGithubAuthV3Service {
  static category = 'version'

  static route = { base: 'conan/v', pattern: ':packageName' }

  static examples = [
    {
      title: 'Conan Center',
      namedParams: { packageName: 'boost' },
      staticPreview: renderVersionBadge({ version: '1.78.0' }),
      keywords: ['c++'],
    },
  ]

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
