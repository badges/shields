'use strict'

const Joi = require('@hapi/joi')
const { isNpmVersion } = require('./package-json-helpers')
const { InvalidParameter } = require('.')

const isLockDependencyMap = Joi.object()
  .pattern(
    /./,
    Joi.object({
      version: isNpmVersion,
    }).required()
  )
  .default({})

const isPackageLockJsonWithDependencies = Joi.object({
  dependencies: isLockDependencyMap,
}).required()

function getLockDependencyVersion({ wantedDependency, dependencies }) {
  const dependency = dependencies[wantedDependency]
  if (dependency === undefined) {
    throw new InvalidParameter({
      prettyMessage: 'dependency not found',
    })
  }

  return {
    range: dependency.version,
  }
}

module.exports = {
  isLockDependencyMap,
  isPackageLockJsonWithDependencies,
  getLockDependencyVersion,
}
