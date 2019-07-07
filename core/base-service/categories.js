'use strict'

const Joi = require('@hapi/joi')
const categories = require('../../services/categories')

const isRealCategory = Joi.equal(categories.map(({ id }) => id)).required()

const isValidCategory = Joi.alternatives()
  .try(isRealCategory, Joi.equal('debug', 'dynamic', 'static').required())
  .required()

function assertValidCategory(category, message = undefined) {
  Joi.assert(category, isValidCategory, message)
}

module.exports = {
  isValidCategory,
  assertValidCategory,
}
