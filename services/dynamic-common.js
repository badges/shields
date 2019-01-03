'use strict'

const Joi = require('joi')
const validate = require('../lib/validate')
const { toArray } = require('../lib/badge-data')
const { InvalidResponse } = require('./errors')

const individualValueSchema = Joi.alternatives()
  .try(Joi.string(), Joi.number())
  .required()

const compoundValueSchema = Joi.alternatives().try(
  individualValueSchema,
  Joi.array()
    .items(individualValueSchema)
    .required(),
  Joi.array().length(0)
)

function transformAndValidate({ data, key }) {
  return validate(
    {
      ErrorClass: InvalidResponse,
      prettyErrorMessage: 'invalid key value',
      traceErrorMessage: 'Key value not valid for dynamic badge',
      traceSuccessMessage: 'Key value after validation',
    },
    data[key],
    compoundValueSchema
  )
}

function renderDynamicBadge({
  defaultLabel,
  tag,
  value,
  prefix = '',
  suffix = '',
}) {
  const renderedValue =
    value === undefined ? 'not specified' : toArray(value).join(', ')
  return {
    label: tag ? `${defaultLabel}@${tag}` : defaultLabel,
    message: `${prefix}${renderedValue}${suffix}`,
    color: 'blue',
  }
}

module.exports = {
  individualValueSchema,
  transformAndValidate,
  renderDynamicBadge,
}
