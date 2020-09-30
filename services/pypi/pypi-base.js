'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  info: Joi.object({
    version: Joi.string().required(),
    // https://github.com/badges/shields/issues/2022
    license: Joi.string().allow(''),
    classifiers: Joi.array().items(Joi.string()).required(),
  }).required(),
  releases: Joi.object()
    .pattern(
      Joi.string(),
      Joi.array()
        .items(
          Joi.object({
            packagetype: Joi.string().required(),
          })
        )
        .required()
    )
    .required(),
}).required()

module.exports = class PypiBase extends BaseJsonService {
  static buildRoute(base) {
    return {
      base,
      pattern: ':egg*',
    }
  }

  async fetch({ egg }) {
    return this._requestJson({
      schema,
      url: `https://pypi.org/pypi/${egg}/json`,
      errorMessages: { 404: 'package or version not found' },
    })
  }
}
