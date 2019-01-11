'use strict'

const Joi = require('joi')
const { InvalidParameter } = require('./errors')

const isDependencyMap = Joi.object()
  .pattern(
    /./,
    // This accepts a semver range, a URL, and many other possible values.
    Joi.string()
      .min(1)
      .required()
  )
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
  isDependencyMap,
  isPackageJsonWithDependencies,
  getDependencyVersion,
}
