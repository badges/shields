/**
 * Common functions and utilities for tasks related to endpoint badges.
 *
 * @module
 */

import Joi from 'joi'
import validate from '../core/base-service/validate.js'
import { InvalidResponse } from './index.js'

const optionalStringWhenNamedLogoPresent = Joi.alternatives().conditional(
  'namedLogo',
  {
    is: Joi.string().required(),
    then: Joi.string(),
  },
)

const optionalNumberWhenAnyLogoPresent = Joi.alternatives()
  .conditional('namedLogo', { is: Joi.string().required(), then: Joi.number() })
  .conditional('logoSvg', { is: Joi.string().required(), then: Joi.number() })

/**
 * Joi schema for validating endpoint.
 *
 * @type {Joi}
 */
const endpointSchema = Joi.object({
  schemaVersion: 1,
  label: Joi.string().allow('').required(),
  message: Joi.string().required(),
  color: Joi.string(),
  labelColor: Joi.string(),
  isError: Joi.boolean().default(false),
  namedLogo: Joi.string(),
  logoSvg: Joi.string(),
  logoColor: optionalStringWhenNamedLogoPresent,
  logoSize: optionalStringWhenNamedLogoPresent,
  logoWidth: optionalNumberWhenAnyLogoPresent,
  style: Joi.string(),
  cacheSeconds: Joi.number().integer().min(0),
  /*
  Retained for legacy compatibility
  Although this does nothing,
  passing it should not throw an error
  */
  logoPosition: optionalNumberWhenAnyLogoPresent,
})
  // `namedLogo` or `logoSvg`; not both.
  .oxor('namedLogo', 'logoSvg')
  .required()

/**
 * Strictly validate the data according to the endpoint schema.
 * This rejects unknown/invalid keys.
 * Optionally it prints those keys in the message to provide detailed feedback.
 *
 * @param {object} data Object containing the data for validation
 * @param {object} attrs Refer to individual attributes
 * @param {string} [attrs.prettyErrorMessage] If provided then error message is set to this value
 * @param {boolean} [attrs.includeKeys] If true then includes error details in error message, defaults to false
 * @throws {InvalidResponse|Error} Error if Joi validation fails due to invalid or no schema
 * @returns {object} Value if Joi validation is success
 */
function validateEndpointData(
  data,
  { prettyErrorMessage = 'invalid response data', includeKeys = false } = {},
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
    endpointSchema,
  )
}

const anySchema = Joi.any()

/**
 * Fetches data from the endpoint and validates the data.
 *
 * @param {object} serviceInstance Instance of Endpoint class
 * @param {object} attrs Refer to individual attributes
 * @param {string} attrs.url Endpoint URL
 * @param {object} attrs.httpErrors Object containing error messages for different error codes
 * @param {string} attrs.validationPrettyErrorMessage If provided then the error message is set to this value
 * @param {boolean} attrs.includeKeys If true then includes error details in error message
 * @returns {object} Data fetched from endpoint
 */
async function fetchEndpointData(
  serviceInstance,
  { url, httpErrors, validationPrettyErrorMessage, includeKeys },
) {
  const json = await serviceInstance._requestJson({
    schema: anySchema,
    url,
    httpErrors,
    logErrors: [],
    options: { decompress: true },
  })
  return validateEndpointData(json, {
    prettyErrorMessage: validationPrettyErrorMessage,
    includeKeys,
  })
}

export { validateEndpointData, fetchEndpointData }
