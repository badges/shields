'use strict'

const emojic = require('emojic')
const Joi = require('@hapi/joi')
const trace = require('./trace')

function validate(
  {
    ErrorClass,
    prettyErrorMessage = 'data does not match schema',
    includeKeys = false,
    traceErrorMessage = 'Data did not match schema',
    traceSuccessMessage = 'Data after validation',
    allowAndStripUnknownKeys = true,
  },
  data,
  schema
) {
  if (!schema || !schema.isJoi) {
    throw Error('A Joi schema is required')
  }
  const options = allowAndStripUnknownKeys
    ? {
        allowUnknown: true,
        stripUnknown: true,
      }
    : undefined
  const { error, value } = Joi.validate(data, schema, options)
  if (error) {
    trace.logTrace(
      'validate',
      emojic.womanShrugging,
      traceErrorMessage,
      error.message
    )

    let prettyMessage = prettyErrorMessage
    if (includeKeys) {
      const keys = error.details.map(({ path }) => path)
      if (keys) {
        prettyMessage = `${prettyErrorMessage}: ${keys.join(', ')}`
      }
    }

    throw new ErrorClass({ prettyMessage, underlyingError: error })
  } else {
    trace.logTrace('validate', emojic.bathtub, traceSuccessMessage, value, {
      deep: true,
    })
    return value
  }
}

module.exports = validate
