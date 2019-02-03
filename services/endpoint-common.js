'use strict'

const Joi = require('joi')
const validate = require('../core/base-service/validate')
const { InvalidResponse } = require('.')

const optionalStringWhenNamedLogoPresent = Joi.alternatives().when(
  'namedLogo',
  {
    is: Joi.string().required(),
    then: Joi.string(),
  }
)

const optionalNumberWhenAnyLogoPresent = Joi.alternatives()
  .when('namedLogo', { is: Joi.string().required(), then: Joi.number() })
  .when('logoSvg', { is: Joi.string().required(), then: Joi.number() })

const endpointSchema = Joi.object({
  schemaVersion: 1,
  label: Joi.string()
    .allow('')
    .required(),
  message: Joi.string().required(),
  color: Joi.string(),
  labelColor: Joi.string(),
  isError: Joi.boolean().default(false),
  namedLogo: Joi.string(),
  logoSvg: Joi.string(),
  logoColor: optionalStringWhenNamedLogoPresent,
  logoWidth: optionalNumberWhenAnyLogoPresent,
  logoPosition: optionalNumberWhenAnyLogoPresent,
  style: Joi.string(),
  cacheSeconds: Joi.number()
    .integer()
    .min(0),
})
  // `namedLogo` or `logoSvg`; not both.
  .oxor('namedLogo', 'logoSvg')
  .required()

// Strictly validate according to the endpoint schema. This rejects unknown /
// invalid keys. Optionally it prints those keys in the message in order to
// provide detailed feedback.
function validateEndpointData(
  data,
  { prettyErrorMessage = 'invalid response data', includeKeys = false } = {}
) {
  return validate(
    {
      ErrorClass: InvalidResponse,
      prettyErrorMessage,
      includeKeys,
      traceErrorMessage: 'Response did not match schema',
      traceSuccessMessage: 'Response after validation',
      allowAndStripUnknownKeys: false,
    },
    data,
    endpointSchema
  )
}

const anySchema = Joi.any()

async function fetchEndpointData(
  serviceInstance,
  { url, errorMessages, validationPrettyErrorMessage, includeKeys }
) {
  const json = await serviceInstance._requestJson({
    schema: anySchema,
    url,
    errorMessages,
  })
  return validateEndpointData(json, {
    prettyErrorMessage: validationPrettyErrorMessage,
    includeKeys,
  })
}

module.exports = {
  validateEndpointData,
  fetchEndpointData,
}
