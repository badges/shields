'use strict'

const Joi = require('joi')

module.exports = {
  nonNegativeInteger: Joi.number()
    .integer()
    .min(0)
    .required(),

  anyInteger: Joi.number()
    .integer()
    .required(),

  // TODO This accepts URLs with query strings and fragments, which for some
  // purposes should be rejected.
  optionalUrl: Joi.string().uri({ scheme: ['http', 'https'] }),
}
