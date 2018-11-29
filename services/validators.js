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
}
