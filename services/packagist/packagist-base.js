import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const packageSchema = Joi.object()
  .pattern(
    /^/,
    Joi.object({
      'default-branch': Joi.bool(),
      version: Joi.string(),
      require: Joi.object({
        php: Joi.string(),
      }),
    }).required()
  )
  .required()

const allVersionsSchema = Joi.object({
  packages: Joi.object().pattern(/^/, packageSchema).required(),
}).required()
const keywords = ['PHP']

class BasePackagistService extends BaseJsonService {
  /**
   * Default fetch method.
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
   * @returns {object} Parsed response
   */
  async fetch({ user, repo, schema, server = 'https://packagist.org' }) {
    const url = `${server}/p/${user.toLowerCase()}/${repo.toLowerCase()}.json`

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

  getDefaultBranch(json, user, repo) {
    const packageName = this.getPackageName(user, repo)
    return Object.values(json.packages[packageName]).find(
      b => b['default-branch'] === true
    )
  }

  getPackageName(user, repo) {
    return `${user.toLowerCase()}/${repo.toLowerCase()}`
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

export {
  allVersionsSchema,
  keywords,
  BasePackagistService,
  customServerDocumentationFragment,
  cacheDocumentationFragment,
}
