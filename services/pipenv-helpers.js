import Joi from 'joi'
import { InvalidParameter } from './index.js'

const isDependency = Joi.object({
  version: Joi.string(),
  ref: Joi.string(),
}).required()

const isLockfile = Joi.object({
  _meta: Joi.object({
    requires: Joi.object({
      python_version: Joi.string(),
    }).required(),
  }).required(),
  default: Joi.object().pattern(Joi.string(), isDependency),
  develop: Joi.object().pattern(Joi.string(), isDependency),
}).required()

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
