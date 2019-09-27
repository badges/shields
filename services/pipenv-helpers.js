'use strict'

const Joi = require('@hapi/joi')
const { InvalidParameter } = require('.')

const isDependency = Joi.object({
  version: Joi.string().required(),
}).required()

const isLockfile = Joi.object({
  _meta: Joi.object({
    requires: Joi.object({
      python_version: Joi.string().required(),
    }).required(),
  }).required(),
  default: Joi.object().pattern(Joi.string().required(), isDependency),
  develop: Joi.object().pattern(Joi.string().required(), isDependency),
}).required()

function getDependencyVersion({
  kind = 'prod',
  wantedDependency,
  lockfileData,
}) {
  let dependenciesOfKind
  if (kind === 'dev') {
    dependenciesOfKind = lockfileData.develop
  } else if (kind === 'prod') {
    dependenciesOfKind = lockfileData.default
  } else {
    throw Error(`Not very kind: ${kind}`)
  }

  if (!(wantedDependency in dependenciesOfKind)) {
    throw new InvalidParameter({
      prettyMessage: `${kind} dependency not found`,
    })
  }

  const { version: range } = dependenciesOfKind[wantedDependency]

  // Strip the `==` which is always present.
  return range.replace('==', '')
}

module.exports = {
  isLockfile,
  getDependencyVersion,
}
