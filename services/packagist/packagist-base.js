import Joi from 'joi'
import { BaseJsonService, NotFound } from '../index.js'
import { isStable, latest } from '../php-version.js'

const packageSchema = Joi.array().items(
  Joi.object({
    version: Joi.string().required(),
    require: Joi.alternatives(
      Joi.object().pattern(Joi.string(), Joi.string()).required(),
      Joi.string().valid('__unset'),
    ),
  }),
)

const allVersionsSchema = Joi.object({
  packages: Joi.object().pattern(/^/, packageSchema).required(),
}).required()

class BasePackagistService extends BaseJsonService {
  /**
   * Default fetch method.
   *
   * This method utilizes composer metadata API which
   * "... is the preferred way to access the data as it is always up to date,
   * and dumped to static files so it is very efficient on our end." (comment from official documentation).
   * For more information please refer to https://packagist.org/apidoc#get-package-data.
   *
   * @param {object} attrs Refer to individual attrs
   * @param {string} attrs.user package user
   * @param {string} attrs.repo package repository
   * @param {Joi} attrs.schema Joi schema to validate the response transformed to JSON
   * @param {string} attrs.server URL for the packagist registry server (Optional)
   * @returns {object} Parsed response
   */
  async fetch({ user, repo, schema, server = 'https://packagist.org' }) {
    const url = `${server}/p2/${user.toLowerCase()}/${repo.toLowerCase()}.json`

    return this._requestJson({
      schema,
      url,
    })
  }

  /**
   * Fetch dev releases method.
   *
   * This method utilizes composer metadata API which
   * "... is the preferred way to access the data as it is always up to date,
   * and dumped to static files so it is very efficient on our end." (comment from official documentation).
   * For more information please refer to https://packagist.org/apidoc#get-package-data.
   *
   * @param {object} attrs Refer to individual attrs
   * @param {string} attrs.user package user
   * @param {string} attrs.repo package repository
   * @param {Joi} attrs.schema Joi schema to validate the response transformed to JSON
   * @param {string} attrs.server URL for the packagist registry server (Optional)
   * @returns {object} Parsed response
   */
  async fetchDev({ user, repo, schema, server = 'https://packagist.org' }) {
    const url = `${server}/p2/${user.toLowerCase()}/${repo.toLowerCase()}~dev.json`

    return this._requestJson({
      schema,
      url,
    })
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
   * @returns {object} Parsed response
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

  getPackageName(user, repo) {
    return `${user.toLowerCase()}/${repo.toLowerCase()}`
  }

  /**
   * Extract the array of minified versions of the given packageName,
   * expand them back to their original format then return.
   *
   * @param {object} json The response of Packagist v2 API.
   * @param {string} packageName The package name.
   *
   * @returns {object[]} An array of version metadata object.
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
   * Find the object representation of the latest release.
   *
   * @param {object[]} versions An array of object representing a version.
   * @param {boolean} includePrereleases Includes pre-release semver for the search.
   *
   * @returns {object} The object of the latest version.
   * @throws {NotFound} Thrown if there is no item from the version array.
   */
  findLatestRelease(versions, includePrereleases = false) {
    // Find the latest version string, if not found, throw NotFound.
    const versionStrings = versions
      .filter(
        version =>
          typeof version.version === 'string' ||
          version.version instanceof String,
      )
      .map(version => version.version)
    if (versionStrings.length < 1) {
      throw new NotFound({ prettyMessage: 'no released version found' })
    }

    let release = latest(versionStrings)
    if (!includePrereleases) {
      release = latest(versionStrings.filter(isStable)) || release
    }
    return versions.filter(version => version.version === release)[0]
  }
}

const description = `
<a href="https://packagist.org/">Packagist</a> is a registry for PHP packages which can be installed with Composer.
`

const customServerDocumentationFragment = `
Note that only network-accessible packagist.org and other self-hosted Packagist instances are supported.
`

const cacheDocumentationFragment = `
Displayed data may be slightly outdated.
Due to performance reasons, data fetched from packagist JSON API is cached for twelve hours on packagist infrastructure.
For more information please refer to <a target="_blank" href="https://packagist.org/apidoc#get-package-data">official packagist documentation</a>.
`

export {
  allVersionsSchema,
  BasePackagistService,
  description,
  customServerDocumentationFragment,
  cacheDocumentationFragment,
}
