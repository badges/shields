'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('..')

const latestVersionSchema = Joi.object({
  package: Joi.object({
    versions: Joi.object({
      'dev-master': Joi.object({
        extra: Joi.object({
          'branch-alias': Joi.object({
            'dev-master': Joi.string().required(),
          }).required(),
        }).required(),
        license: Joi.array().required(),
      }).required(),
    }).required(),
    downloads: Joi.object({
      total: Joi.number().required(),
      monthly: Joi.number().required(),
      daily: Joi.number().required(),
    }).required(),
  }).required(),
}).required()

class BasePackagistService extends BaseJsonService {
  static log(message) {
    console.log(message)
  }

  async fetch({ user, repo, schema = latestVersionSchema }) {
    const url = `https://packagist.org/packages/${user}/${repo}.json`

    return this._requestJson({
      schema,
      url,
    })
  }

  static get defaultBadgeData() {
    return { label: 'packagist' }
  }
}

module.exports = { latestVersionSchema, BasePackagistService }
