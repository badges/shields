'use strict'

const Joi = require('@hapi/joi')
const { BaseJsonService } = require('..')

const allVersionsSchema = Joi.object({
  package: Joi.object({
    versions: Joi.object()
      .pattern(
        /^/,
        Joi.object({
          version: Joi.string(),
          require: Joi.object({
            php: Joi.string(),
          }),
        })
      )
      .required(),
  }).required(),
}).required()

const keywords = ['PHP']

class BasePackagistService extends BaseJsonService {
  async fetch({ user, repo, schema }) {
    const url = `https://packagist.org/packages/${user}/${repo}.json`

    return this._requestJson({
      schema,
      url,
    })
  }
}

module.exports = { allVersionsSchema, keywords, BasePackagistService }
