import yaml from 'js-yaml'
import { NotFound, InvalidResponse } from '../index.js'
import { renderVersionBadge } from '../version.js'
import { ConditionalGithubAuthV3Service } from '../github/github-auth-service.js'
import { fetchRepoContent } from '../github/github-common-fetch.js'
import { compareVersions } from './conan-version-helpers.js'

export default class ConanVersion extends ConditionalGithubAuthV3Service {
  static category = 'version'

  static route = { base: 'conan/v', pattern: ':packageName' }

  static examples = [
    {
      title: 'Conan Center',
      namedParams: { packageName: 'boost' },
      staticPreview: this.render({ version: '1.78.0' }),
      keywords: ['c++'],
    },
  ]

  static defaultBadgeData = { label: 'conan' }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ packageName }) {
    const configContent = await fetchRepoContent(this, {
      user: 'conan-io',
      repo: 'conan-center-index',
      branch: 'master',
      filename: `recipes/${packageName}/config.yml`,
    })

    let versions
    try {
      const config = yaml.load(configContent)
      versions = Object.keys(config.versions)
    } catch (err) {
      throw new InvalidResponse({
        prettyMessage: 'invalid config.yml',
        underlyingError: err,
      })
    }
    versions.sort(compareVersions)

    if (versions.length === 0) {
      throw new NotFound({ prettyMessage: 'no versions found' })
    }

    return this.constructor.render({ version: versions[versions.length - 1] })
  }
}
