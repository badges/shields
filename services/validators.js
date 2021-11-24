import {
  semver as joiSemver,
  semverRange as joiSemverRange,
} from 'joi-extension-semver'
import joi from 'joi'
const Joi = joi.extend(joiSemver).extend(joiSemverRange)

const optionalNonNegativeInteger = Joi.number().integer().min(0)

export { optionalNonNegativeInteger }
export const nonNegativeInteger = optionalNonNegativeInteger.required()
export const anyInteger = Joi.number().integer().required()
export const semver = Joi.semver().valid().required()
export const semverRange = Joi.semverRange().valid().required()
export const optionalDottedVersionNClausesWithOptionalSuffix =
  Joi.string().regex(/^\d+(\.\d+)*([-+].*)?$/)
// TODO This accepts URLs with query strings and fragments, which for some
// purposes should be rejected.
export const optionalUrl = Joi.string().uri({ scheme: ['http', 'https'] })

// validator for a file size we are going to pass to bytes.parse
// see https://github.com/visionmedia/bytes.js#bytesparsestringnumber-value-numbernull
export const fileSize = Joi.string()
  .regex(/^[0-9]+(b|kb|mb|gb|tb)$/i)
  .required()
