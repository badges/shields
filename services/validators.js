'use strict'

const Joi = require('joi').extend(require('joi-extension-semver'))

module.exports = {
  nonNegativeInteger: Joi.number()
    .integer()
    .min(0)
    .required(),

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
