'use strict'

const Joi = require('@hapi/joi')
const { BaseJsonService } = require('..')

const versionSchema = Joi.object()
  .pattern(
    /^/,
    Joi.object({
      version: Joi.string(),
      require: Joi.object({
        php: Joi.string(),
      }),
    }).required()
  )
  .required()

const allVersionsSchema = Joi.object({
  packages: Joi.object().pattern(/^/, versionSchema),
}).required()
const keywords = ['PHP']

class BasePackagistService extends BaseJsonService {
  async fetch({ user, repo, schema, server = 'https://packagist.org' }) {
    const url = `${server}/p/${user}/${repo}.json`

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
   * For more information refer to https://packagist.org/apidoc#get-package-data.
   *
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
}

const documentation =
  'Note that only network-accessible packagist.org and other self-hosted Packagist instances are supported.'

module.exports = {
  allVersionsSchema,
  keywords,
  BasePackagistService,
  documentation,
}
