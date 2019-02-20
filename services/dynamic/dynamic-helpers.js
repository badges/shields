'use strict'

const Joi = require('joi')
const { optionalUrl } = require('../validators')

const queryParamSchema = Joi.object({
  url: optionalUrl.required(),
  query: Joi.string().required(),
  prefix: Joi.alternatives().try(Joi.string(), Joi.number()),
  suffix: Joi.alternatives().try(Joi.string(), Joi.number()),
})
  .rename('uri', 'url', { ignoreUndefined: true, override: true })
  .required()

function createRoute(which) {
  return {
    base: `badge/dynamic/${which}`,
    pattern: '',
    queryParamSchema,
  }
}

module.exports = {
  createRoute,
}
