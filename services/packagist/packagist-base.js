import Joi from 'joi'
import { BaseJsonService, NotFound } from '../index.js'
import { isStable, latest } from '../php-version.js'

const messageInvalidVersion = 'invalid version'
const messageLicenseNotFound = 'license not found'
const messageNoReleasedVersionFound = 'no released version found'
const messagePhpVersionNotFound = 'version requirement not found'

const packageSchema = Joi.array().items(
  Joi.object({
    version: Joi.string().required(),
    require: Joi.object({
      php: Joi.string(),
    }),
  })
)

const composerMetadatApiSchema = Joi.object({
  packages: Joi.object().pattern(/^/, packageSchema).required(),
}).required()
const keywords = ['PHP']

class BasePackagistService extends BaseJsonService {
  /**
   * Fetch metadata of tagged releases.
   *
   * This method utilize composer metadata API which
   * "... is the preferred way to access the data as it is always up to date,
   * and dumped to static files so it is very efficient on our end." (comment from official documentation).
   * For more information please refer to https://packagist.org/apidoc#get-package-data.
   *
   * @param {object} attrs Refer to individual attrs
   * @param {string} attrs.user package user
   * @param {string} attrs.repo package repository
   * @param {Joi} attrs.schema Joi schema to validate the response transformed to JSON
   * @param {string} attrs.server URL for the packagist registry server (Optional)
   *
   * @returns {object[]} An array of package version metadata objects
   */
  async fetchRelease({
    user,
    repo,
    schema = composerMetadatApiSchema,
    server = 'https://packagist.org',
  }) {
    const packageName = `${user.toLowerCase()}/${repo.toLowerCase()}`
    const url = `${server}/p2/${packageName}.json`
    const json = await this._requestJson({
      schema,
      url,
    })
    return this.constructor.expandPackageVersions(json, packageName)
  }

  /**
   * Fetch metadata of HEAD of the development branches.
   *
   * This method utilize composer metadata API which
   * "... is the preferred way to access the data as it is always up to date,
   * and dumped to static files so it is very efficient on our end." (comment from official documentation).
   * For more information please refer to https://packagist.org/apidoc#get-package-data.
   *
   * @param {object} attrs Refer to individual attrs
   * @param {string} attrs.user package user
   * @param {string} attrs.repo package repository
   * @param {Joi} attrs.schema Joi schema to validate the response transformed to JSON
   * @param {string} attrs.server URL for the packagist registry server (Optional)
   *
   * @returns {object[]} An array of package version metadata objects
   */
  async fetchDev({
    user,
    repo,
    schema = composerMetadatApiSchema,
    server = 'https://packagist.org',
  }) {
    const packageName = `${user.toLowerCase()}/${repo.toLowerCase()}`
    const url = `${server}/p2/${packageName}~dev.json`
    const json = await this._requestJson({
      schema,
      url,
    })
    return this.constructor.expandPackageVersions(json, packageName)
  }

  /**
   * It is highly recommended to use base fetch method!
   *
   * JSON API includes additional information about downloads, dependents count, github info, etc.
   * However, responses from JSON API are cached for twelve hours by packagist servers,
   * so data fetch from this method might be outdated.
   * For more information please refer to https://packagist.org/apidoc#get-package-data.
   *
   * @param {object} attrs Refer to individual attrs
   * @param {string} attrs.user package user
   * @param {string} attrs.repo package repository
   * @param {Joi} attrs.schema Joi schema to validate the response transformed to JSON
   * @param {string} attrs.server URL for the packagist registry server (Optional)
   *
   * @returns {object[]} An array of package version metadata objects
   */
  async fetchByJsonAPI({
    user,
    repo,
    schema,
    server = 'https://packagist.org',
  }) {
    const url = `${server}/packages/${user}/${repo}.json`

    return this._requestJson({
      schema,
      url,
    })
  }

  /**
   * Extract the array of minified versions of the given packageName,
   * expand them back to their original format then return.
   *
   * @param {object} json The response of Packagist v2 API.
   * @param {string} packageName The package name.
   *
   * @returns {object[]} An array of package version metadata objects.
   *
   * @see https://github.com/composer/metadata-minifier/blob/c549d23829536f0d0e984aaabbf02af91f443207/src/MetadataMinifier.php#L16-L46
   */
  static expandPackageVersions(json, packageName) {
    const versions = json.packages[packageName]
    const expanded = []
    let expandedVersion = null

    for (const i in versions) {
      const versionData = versions[i]
      if (!expandedVersion) {
        expandedVersion = { ...versionData }
        expanded.push(expandedVersion)
        continue
      }

      expandedVersion = { ...expandedVersion, ...versionData }
      for (const key in expandedVersion) {
        if (expandedVersion[key] === '__unset') {
          delete expandedVersion[key]
        }
      }
      expanded.push(expandedVersion)
    }

    return expanded
  }

  /**
   * Find the package version object of either the latest
   * tagged version or the specified version.
   *
   * @param {object[]} versions An (expanded) array of package version objects.
   * @param {object} options A key-value object for options.
   * @param {string} [options.version] A specific version string to look for
   *   (Optional). Default ''.
   * @param {boolean} [options.includePrereleases] If pre-release tags are
   *   included in the search (Optional). Default: false.
   * @param {boolean} [options.includeDefaultBranch] If default branch
   *   version are included in the search (Optional). Default: false.
   *
   * @returns {object} A package version metadata object.
   *
   * @throws {NotFound} If a release version is not found, or if the specified
   *   version is not found.
   */
  static findVersion(
    versions,
    {
      version = '',
      includePrereleases = false,
      includeDefaultBranch = false,
    } = {}
  ) {
    return version === ''
      ? this.findLatestVersion(versions, {
          includePrereleases,
          includeDefaultBranch,
        })
      : this.findSpecifiedVersion(versions, version)
  }

  /**
   * Find the object representation of the latest release.
   *
   * @param {object[]} versions An array of object representing a version.
   * @param {object} options Options for searching the latest version.
   * @param {boolean} options.includePrereleases Includes pre-release semver for the search.
   * @param {boolean} options.includeDefaultBranch Includes pre-release semver for the search.
   *
   * @returns {object} A package version metadata object.
   * @throws {NotFound} Thrown if there is no item from the version array.
   */
  static findLatestVersion(
    versions,
    { includePrereleases = false, includeDefaultBranch = false } = {}
  ) {
    // Find the latest version string, if not found, throw NotFound.
    let versionsToSearch = versions.filter(
      version =>
        typeof version.version === 'string' || version.version instanceof String
    )

    // filter all branches, or
    // leave default branch here when specified
    versionsToSearch = includeDefaultBranch
      ? versionsToSearch.filter(
          metadata =>
            !metadata.version.startsWith('dev-') ||
            metadata['default-branch'] === true
        )
      : versionsToSearch.filter(({ version }) => !version.startsWith('dev-'))
    if (versionsToSearch.length < 1) {
      throw new NotFound({ prettyMessage: messageNoReleasedVersionFound })
    }

    // Find the release version string
    const versionStrings = versionsToSearch.map(({ version }) => version)
    let release = latest(versionStrings)
    if (!includePrereleases) {
      // if specified to not include prerelease, will still fallback to
      // pre-release versions when no stable release is found.
      release = latest(versionStrings.filter(isStable)) || release
    }

    if (release === undefined) {
      throw new NotFound({ prettyMessage: messageNoReleasedVersionFound })
    }
    return versions.filter(version => version.version === release)[0]
  }

  /**
   * Find the specified package version from thegiven API response.
   *
   * @param {Array} versions An array of package versions.
   * @param {string} version The version specifier.
   *
   * @returns {object} A package version metadata object.
   *
   * @throws {NotFound} If the specified version is not found.
   */
  static findSpecifiedVersion(versions, version) {
    const index = versions.findIndex(v => v.version === version)
    if (index === -1) {
      throw new NotFound({ prettyMessage: messageInvalidVersion })
    }
    return versions[index]
  }
}

const customServerDocumentationFragment = `
    <p>
        Note that only network-accessible packagist.org and other self-hosted Packagist instances are supported.
    </p>
    `

const cacheDocumentationFragment = `
  <p>
      Displayed data may be slightly outdated.
      Due to performance reasons, data fetched from packagist JSON API is cached for twelve hours on packagist infrastructure.
      For more information please refer to <a target="_blank" href="https://packagist.org/apidoc#get-package-data">official packagist documentation</a>.
  </p>
  `

export default BasePackagistService

export {
  composerMetadatApiSchema,
  keywords,
  BasePackagistService,
  customServerDocumentationFragment,
  cacheDocumentationFragment,
  messageInvalidVersion,
  messageLicenseNotFound,
  messageNoReleasedVersionFound,
  messagePhpVersionNotFound,
}
