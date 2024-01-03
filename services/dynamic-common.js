/**
 * Common functions and utilities for tasks related to dynamic badges.
 *
 * @module
 */

import Joi from 'joi'
import toArray from '../core/base-service/to-array.js'
import validate from '../core/base-service/validate.js'
import { InvalidResponse } from './index.js'

/**
 * Map of error codes and their corresponding error messages.
 *
 * @type {object}
 */
const httpErrors = {
  404: 'resource not found',
}

/**
 * Joi schema for validating individual value.
 * Checks if the individual value is of type string or number.
 *
 * @type {Joi}
 */
const individualValueSchema = Joi.alternatives()
  .try(Joi.string(), Joi.number())
  .required()

/**
 * Joi schema for validating compound value.
 * Checks if the compound value is of type individualValueSchema, array of individualValueSchema or empty array.
 *
 * @type {Joi}
 */
const compoundValueSchema = Joi.alternatives().try(
  individualValueSchema,
  Joi.array().items(individualValueSchema).required(),
  Joi.array().length(0),
)

/**
 * Look up the value in the data object by key and validate the value against compoundValueSchema.
 *
 * @param {object} attrs Refer to individual attributes
 * @param {object} attrs.data Object containing the data for validation
 * @param {string} attrs.key Key to retrieve the data from object for validation
 * @throws {InvalidResponse|Error} Error if Joi validation fails due to invalid or no schema
 * @returns {object} Value if Joi validation is success
 */
function transformAndValidate({ data, key }) {
  return validate(
    {
      ErrorClass: InvalidResponse,
      prettyErrorMessage: 'invalid key value',
      traceErrorMessage: 'Key value not valid for dynamic badge',
      traceSuccessMessage: 'Key value after validation',
    },
    data[key],
    compoundValueSchema,
  )
}

/**
 * Handles rendering concerns of dynamic badges.
 * Determines the label of the badge according to the tag and defaultLabel.
 * Determines the message of the badge according to the prefix, suffix and value.
 * Sets the color of the badge to blue.
 *
 * @param {object} attrs Refer to individual attributes
 * @param {string} attrs.defaultLabel default badge label
 * @param {string} [attrs.tag] If provided then this value will be appended to the badge label, e.g. `foobar@v1.23`
 * @param {any} attrs.value Value or array of value to be used for the badge message
 * @param {string} [attrs.prefix] If provided then the badge message will use this value as a prefix
 * @param {string} [attrs.suffix] If provided then the badge message will use this value as a suffix
 * @returns {object} Badge with label, message and color properties
 */
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

export {
  httpErrors,
  individualValueSchema,
  transformAndValidate,
  renderDynamicBadge,
}
