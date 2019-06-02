'use strict'

const Joi = require('@hapi/joi').extend(require('joi-extension-semver'))

const optionalNonNegativeInteger = Joi.number()
  .integer()
  .min(0)

module.exports = {
  optionalNonNegativeInteger,

  nonNegativeInteger: optionalNonNegativeInteger.required(),

  anyInteger: Joi.number()
    .integer()
    .required(),

  semver: Joi.semver()
    .valid()
    .required(),

  semverRange: Joi.semver()
    .validRange()
    .required(),

  optionalDottedVersionNClausesWithOptionalSuffix: Joi.string().regex(
    /^\d+(\.\d+)*([-+].*)?$/
  ),

  // TODO This accepts URLs with query strings and fragments, which for some
  // purposes should be rejected.
  optionalUrl: Joi.string().uri({ scheme: ['http', 'https'] }),
}
