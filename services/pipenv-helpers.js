/**
 * Common functions and utilities for tasks related to pipenv
 *
 * @module
 */

import Joi from 'joi'
import { InvalidParameter } from './index.js'

/**
 * Joi schema for validating dependency.
 *
 * @type {Joi}
 */
const isDependency = Joi.object({
  version: Joi.string(),
  ref: Joi.string(),
}).required()

/**
 * Joi schema for validating lock file object.
 * Checks if the lock file object has required properties and the properties are valid.
 *
 * @type {Joi}
 */
const isLockfile = Joi.object({
  _meta: Joi.object({
    requires: Joi.object({
      python_version: Joi.string(),
    }).required(),
  }).required(),
  default: Joi.object().pattern(Joi.string(), isDependency),
  develop: Joi.object().pattern(Joi.string(), isDependency),
}).required()

/**
 * Determines the dependency version based on the dependency type.
 *
 * @param {object} attrs - Refer to individual attributes
 * @param {string} attrs.kind - Wanted dependency type ('dev' or 'default'), defaults to 'default'
 * @param {string} attrs.wantedDependency - Name of the wanted dependency
 * @param {object} attrs.lockfileData - Object containing lock file data
 * @throws {Error} - Error if unknown dependency type provided
 * @throws {InvalidParameter} - Error if wanted dependency is not present in lock file data
 * @throws {InvalidParameter} - Error if version or ref is not present for the wanted dependency
 * @returns {object} Object containing wanted dependency version or ref
 */
function getDependencyVersion({
  kind = 'default',
  wantedDependency,
  lockfileData,
}) {
  let dependenciesOfKind
  if (kind === 'dev') {
    dependenciesOfKind = lockfileData.develop
  } else if (kind === 'default') {
    dependenciesOfKind = lockfileData.default
  } else {
    throw Error(`Not very kind: ${kind}`)
  }

  if (!(wantedDependency in dependenciesOfKind)) {
    throw new InvalidParameter({
      prettyMessage: `${kind} dependency not found`,
    })
  }

  const { version, ref } = dependenciesOfKind[wantedDependency]

  if (version) {
    // Strip the `==` which is always present.
    return { version: version.replace('==', '') }
  } else if (ref) {
    if (ref.length === 40) {
      // assume it is a commit hash
      return { ref: ref.substring(0, 7) }
    }
    return { ref } // tag
  } else {
    throw new InvalidParameter({
      prettyMessage: `No version or ref for ${wantedDependency}`,
    })
  }
}

export { isLockfile, getDependencyVersion }
