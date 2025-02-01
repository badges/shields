/**
 * This module contains commonly used validators.
 *
 * @module
 */

import {
  semver as joiSemver,
  semverRange as joiSemverRange,
} from 'joi-extension-semver'
import joi from 'joi'
const Joi = joi.extend(joiSemver).extend(joiSemverRange)

/**
 * Joi validator that checks if a value is a number, an integer, and greater than or equal to zero.
 *
 * @type {Joi}
 */
const optionalNonNegativeInteger = Joi.number().integer().min(0)

export { optionalNonNegativeInteger }

/**
 * Joi validator that checks if a value is a number, an integer, greater than or equal to zero and the value must be present.
 *
 * @type {Joi}
 */
export const nonNegativeInteger = optionalNonNegativeInteger.required()

/**
 * Joi validator that checks if a value is a number, an integer and the value must be present.
 *
 * @type {Joi}
 */
export const anyInteger = Joi.number().integer().required()

/**
 * Joi validator that checks if a value is a valid semantic versioning string and the value must be present.
 *
 * @type {Joi}
 */
export const semver = Joi.semver().valid().required()

/**
 * Joi validator that checks if a value is a valid semantic versioning range and the value must be present.
 *
 * @type {Joi}
 */
export const semverRange = Joi.semverRange().valid().required()

/**
 * Joi validator that checks if a value is a string that matches a regular expression.
 * The regular expression matches strings that start with one or more digits, followed by zero or more groups of a dot and one or more digits,
 * followed by an optional suffix that starts with a dash or a plus sign and can contain any characters.
 * This validator can be used to validate properties that can be version strings with an optional suffix or absent.
 * For example, some valid values for this validator are: 1, 1.0, 1.0.0, 1.0.0-beta
 * Some invalid values for this validator are: abc, 1.a, 1.0-, .1
 *
 * @type {Joi}
 */
export const optionalDottedVersionNClausesWithOptionalSuffix =
  Joi.string().regex(/^\d+(\.\d+)*([-+].*)?$/)

/**
 * Joi validator that checks if a value is a URL
 *
 * TODO: This accepts URLs with query strings and fragments, which for some purposes should be rejected.
 *
 * @type {Joi}
 */
export const optionalUrl = Joi.string().uri({ scheme: ['http', 'https'] })

/**
 * Joi validator that checks if a value is a URL and the value must be present.
 *
 * @type {Joi}
 */
export const url = optionalUrl.required()

/**
 * Joi validator for a file size we are going to pass to bytes.parse
 * see https://github.com/visionmedia/bytes.js#bytesparsestringnumber-value-numbernull
 *
 * @type {Joi}
 */
export const fileSize = Joi.string()
  .regex(/^[0-9]+(b|kb|mb|gb|tb)$/i)
  .required()

/**
 * Joi validator that checks if a value is a relative-only URI
 *
 * @type {Joi}
 */
export const relativeUri = Joi.string().uri({ relativeOnly: true })
