/**
 * Common functions and utilities for tasks related to package.json
 *
 * @module
 */

import Joi from 'joi'
import { InvalidParameter } from './index.js'

/**
 * Joi schema for validating dependency map.
 *
 * @type {Joi}
 */
const isDependencyMap = Joi.object()
  .pattern(
    /./,
    // This accepts a semver range, a URL, and many other possible values.
    Joi.string().min(1).required(),
  )
  .default({})

/**
 * Joi schema for validating package json object.
 * Checks if the object has all the dependency types and the dependency types are valid.
 *
 * @type {Joi}
 */
const isPackageJsonWithDependencies = Joi.object({
  dependencies: isDependencyMap,
  devDependencies: isDependencyMap,
  peerDependencies: isDependencyMap,
  optionalDependencies: isDependencyMap,
}).required()

/**
 * Determines the dependency version based on the dependency type.
 *
 * @param {object} attrs - Refer to individual attributes
 * @param {string} attrs.kind - Wanted dependency type, defaults to prod
 * @param {string} attrs.wantedDependency - Name of the wanted dependency
 * @param {object} attrs.dependencies - Map of dependencies
 * @param {object} attrs.devDependencies - Map of dev dependencies
 * @param {object} attrs.peerDependencies - Map of peer dependencies
 * @param {object} attrs.optionalDependencies - Map of optional dependencies
 * @throws {string} - Error message if unknown dependency type provided
 * @throws {InvalidParameter} - Error if wanted dependency is not present
 * @returns {string} Semver range of the wanted dependency (eg. ~2.1.6 or >=3.0.0 or <4.0.0)
 */
function getDependencyVersion({
  kind = 'prod',
  wantedDependency,
  dependencies,
  devDependencies,
  peerDependencies,
  optionalDependencies,
}) {
  const dependencyMaps = {
    peer: peerDependencies,
    optional: optionalDependencies,
    dev: devDependencies,
    prod: dependencies,
  }

  if (!(kind in dependencyMaps)) {
    throw Error(`Not very kind: ${kind}`)
  }
  const range = dependencyMaps[kind][wantedDependency]
  if (range === undefined) {
    throw new InvalidParameter({
      prettyMessage: `${kind} dependency not found`,
    })
  }

  return range
}

export { isDependencyMap, isPackageJsonWithDependencies, getDependencyVersion }
