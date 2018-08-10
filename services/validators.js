'use strict'

const Joi = require('joi')

const nonNegativeInteger = Joi.number()
  .integer()
  .min(0)
  .required()

module.exports = {
  nonNegativeInteger,
}
