import Joi from 'joi'
import { InvalidParameter } from './index.js'

const isDependencyMap = Joi.object()
  .pattern(
    /./,
    // This accepts a semver range, a URL, and many other possible values.
    Joi.string().min(1).required()
  )
  .default({})

const isPackageJsonWithDependencies = Joi.object({
  dependencies: isDependencyMap,
  devDependencies: isDependencyMap,
  peerDependencies: isDependencyMap,
  optionalDependencies: isDependencyMap,
}).required()

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

  return { range }
}

export { isDependencyMap, isPackageJsonWithDependencies, getDependencyVersion }
