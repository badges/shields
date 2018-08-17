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
}
