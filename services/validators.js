'use strict'

const Joi = require('joi')

const positiveInteger = Joi.number()
  .integer()
  .min(0)
  .required()

module.exports = {
  positiveInteger,
}
