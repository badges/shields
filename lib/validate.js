'use strict'

const emojic = require('emojic')
const Joi = require('joi')
const trace = require('../services/trace')

function validate(
  {
    ErrorClass,
    prettyErrorMessage = 'data does not match schema',
    traceErrorMessage = 'Data did not match schema',
    traceSuccessMessage = 'Data after validation',
  },
  data,
  schema
) {
  if (!schema || !schema.isJoi) {
    throw Error('A Joi schema is required')
  }
  const { error, value } = Joi.validate(data, schema, {
    allowUnknown: true,
    stripUnknown: true,
  })
  if (error) {
    trace.logTrace(
      'validate',
      emojic.womanShrugging,
      traceErrorMessage,
      error.message
    )
    throw new ErrorClass({
      prettyMessage: prettyErrorMessage,
      underlyingError: error,
    })
  } else {
    trace.logTrace('validate', emojic.bathtub, traceSuccessMessage, value, {
      deep: true,
    })
    return value
  }
}

module.exports = validate
