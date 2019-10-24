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
}

const documentation =
  'Note that only network-accessible packagist.org and other self-hosted Packagist instances are supported.'

module.exports = {
  allVersionsSchema,
  keywords,
  BasePackagistService,
  documentation,
}
