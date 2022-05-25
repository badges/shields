/**
 * Common functions and utilities for tasks related to deprecation.
 *
 * @module
 */

import { Deprecated } from './index.js'

/**
 * Checks if the effective date is deprecated or not by comparing it with the current time.
 * A date is considered to be deprecated if its timestamp is less than or equal to the current timestamp.
 * Deprecated Error will be thrown if the effective date is deprecated.
 *
 * @param {object} effectiveDate Date object
 * @throws {Deprecated} Deprecated Error
 */
function enforceDeprecation(effectiveDate) {
  if (Date.now() >= effectiveDate.getTime()) {
    throw new Deprecated()
  }
}

export { enforceDeprecation }
