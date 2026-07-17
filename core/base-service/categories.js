/**
 * Helpers for validating service category identifiers.
 *
 * @module
 */

import Joi from 'joi'
import categories from '../../services/categories.js'

const isRealCategory = Joi.equal(...categories.map(({ id }) => id)).required()

/**
 * Joi validator for service categories registered by Shields, including the
 * special `debug`, `dynamic`, and `static` categories.
 *
 * @type {Joi}
 */
const isValidCategory = Joi.alternatives()
  .try(isRealCategory, Joi.equal('debug', 'dynamic', 'static').required())
  .required()

/**
 * Assert that a value is a valid Shields service category.
 *
 * @param {string} category - Service category identifier to validate.
 * @param {string} [message] - Optional prefix for the validation error.
 * @throws {Error} When the category is not recognized.
 * @returns {void}
 */
function assertValidCategory(category, message = undefined) {
  Joi.assert(category, isValidCategory, message)
}

export { isValidCategory, assertValidCategory }
