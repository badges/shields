'use strict'

const Joi = require('@hapi/joi')
const { InvalidParameter } = require('.')

// This accepts a semver range, a URL, and many other possible values.
const isNpmVersion = Joi.string()
  .min(1)
  .required()

const isDependencyMap = Joi.object()
  .pattern(/./, isNpmVersion)
  .default({})

const isPackageJsonWithDependencies = Joi.object({
  dependencies: isDependencyMap,
  devDependencies: isDependencyMap,
  peerDependencies: isDependencyMap,
}).required()

function getDependencyVersion({
  kind = 'prod',
  wantedDependency,
  dependencies,
  devDependencies,
  peerDependencies,
}) {
  let dependenciesOfKind
  if (kind === 'peer') {
    dependenciesOfKind = peerDependencies
  } else if (kind === 'dev') {
    dependenciesOfKind = devDependencies
  } else if (kind === 'prod') {
    dependenciesOfKind = dependencies
  } else {
    throw Error(`Not very kind: ${kind}`)
  }

  const range = dependenciesOfKind[wantedDependency]
  if (range === undefined) {
    throw new InvalidParameter({
      prettyMessage: `${kind} dependency not found`,
    })
  }

  return { range }
}

module.exports = {
  isNpmVersion,
  isDependencyMap,
  isPackageJsonWithDependencies,
  getDependencyVersion,
}
