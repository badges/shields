'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('..')

const latestVersionSchema = Joi.object({
  package: Joi.object({
    versions: Joi.object({
      'dev-master': Joi.object({
        license: Joi.array().required(),
        extra: Joi.object({
          'branch-alias': Joi.object({
            'dev-master': Joi.string().required(),
          }).required(),
        }),
      }).required(),
    }).required(),
    downloads: Joi.object({
      total: Joi.number().required(),
      monthly: Joi.number().required(),
      daily: Joi.number().required(),
    }).required(),
  }).required(),
}).required()

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
  async fetch({ user, repo, schema = latestVersionSchema }) {
    const url = `https://packagist.org/packages/${user}/${repo}.json`

    return this._requestJson({
      schema,
      url,
    })
  }
}

module.exports = { allVersionsSchema, keywords, BasePackagistService }
