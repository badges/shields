import Joi from 'joi'
import { optionalUrl } from '../validators.js'
import { NotFound } from '../index.js'
import {
  allVersionsSchema,
  BasePackagistService,
  customServerDocumentationFragment,
} from './packagist-base.js'

const queryParamSchema = Joi.object({
  server: optionalUrl,
}).required()

export default class PackagistPhpVersion extends BasePackagistService {
  static category = 'platform-support'

  static route = {
    base: 'packagist/php-v',
    pattern: ':user/:repo/:version?',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Packagist PHP Version Support',
      pattern: ':user/:repo',
      namedParams: {
        user: 'symfony',
        repo: 'symfony',
      },
      staticPreview: this.render({ php: '^7.1.3' }),
    },
    {
      title: 'Packagist PHP Version Support (specify version)',
      pattern: ':user/:repo/:version',
      namedParams: {
        user: 'symfony',
        repo: 'symfony',
        version: 'v2.8.0',
      },
      staticPreview: this.render({ php: '>=5.3.9' }),
    },
    {
      title: 'Packagist PHP Version Support (custom server)',
      pattern: ':user/:repo',
      namedParams: {
        user: 'symfony',
        repo: 'symfony',
      },
      queryParams: {
        server: 'https://packagist.org',
      },
      staticPreview: this.render({ php: '^7.1.3' }),
      documentation: customServerDocumentationFragment,
    },
  ]

  static defaultBadgeData = {
    label: 'php',
    color: 'blue',
  }

  static render({ php }) {
    return {
      message: php,
    }
  }

  /**
   * Find the specified package version from thegiven API response.
   *
   * @param {Array} versions An array of package versions.
   * @param {string} version The version specifier.
   *
   * @returns {object} The package version object.
   *
   * @throws {NotFound} If the specified version is not found.
   */
  findSpecifiedVersion(versions, version) {
    const index = versions.findIndex(v => v.version === version)
    if (index === -1) {
      throw new NotFound({ prettyMessage: 'invalid version' })
    }
    return versions[index]
  }

  /**
   * Get the PHP version requirement of the latest release or
   * the specified package version.
   *
   * @param {object} attrs An object with all the query details.
   * @param {object[]} attrs.versions An array of package version objects.
   * @param {string} [attrs.version] The version specifier, if intented to
   * search specific version for the php requirement (Optional).
   *
   * @returns {object} An object with the key "phpVersion" specifying
   * the version requirement.
   *
   * @throws {NotFound} Either if:
   * - a release version is not found; or
   * - the specified version is not found; or
   * - the version is found but has no php version specified.
   */
  getPhpVersion({ versions, version = '' }) {
    let packageVersion
    if (version === '') {
      packageVersion = this.constructor.findLatestRelease(versions)
    } else {
      packageVersion = this.findSpecifiedVersion(versions, version)
    }

    if (!packageVersion.require || !packageVersion.require.php) {
      throw new NotFound({ prettyMessage: 'version requirement not found' })
    }

    return { phpVersion: packageVersion.require.php }
  }

  async handle({ user, repo, version = '' }, { server }) {
    const versions = await this.fetchVersions({
      user,
      repo,
      schema: allVersionsSchema,
      server,
    })
    const { phpVersion } = this.getPhpVersion({
      versions,
      user,
      repo,
      version,
      server,
    })
    return this.constructor.render({ php: phpVersion })
  }
}
