'use strict'

const Joi = require('joi')
const toArray = require('../core/base-service/to-array')
const validate = require('../core/base-service/validate')
const { InvalidResponse } = require('.')

const errorMessages = {
  404: 'resource not found',
}

const individualValueSchema = Joi.alternatives()
  .try(Joi.string(), Joi.number())
  .required()

const compoundValueSchema = Joi.alternatives().try(
  individualValueSchema,
  Joi.array().items(individualValueSchema).required(),
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
  errorMessages,
  individualValueSchema,
  transformAndValidate,
  renderDynamicBadge,
}
