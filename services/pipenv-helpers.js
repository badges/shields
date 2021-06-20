import Joi from 'joi'
import { InvalidParameter } from './index.js'

const isDependency = Joi.alternatives(
  Joi.object({
    version: Joi.string().required(),
  }).required(),
  Joi.object({
    ref: Joi.string().required(),
  }).required()
)

const isLockfile = Joi.object({
  _meta: Joi.object({
    requires: Joi.object({
      python_version: Joi.string(),
    }).required(),
  }).required(),
  default: Joi.object().pattern(Joi.string().required(), isDependency),
  develop: Joi.object().pattern(Joi.string().required(), isDependency),
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
  } else {
    return { ref: ref.substring(1, 8) }
  }
}

export { isLockfile, getDependencyVersion }
