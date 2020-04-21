'use strict'
const deepmerge = require('deepmerge')

class RedundantCustomConfiguration extends Error {
  constructor(message) {
    super(message)
    this.name = 'RedundantCustomConfiguration'
  }
}

function merge(_default, custom) {
  // Overwrites the existing array values completely rather than concatenating them
  // recipe from https://github.com/TehShrike/deepmerge#arraymerge
  const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray
  return deepmerge(_default, custom, {
    arrayMerge: overwriteMerge,
  })
}

function checkCustomIntegrationConfiguration(config, serviceClasses) {
  const serviceNames = new Set(
    serviceClasses.map(serviceClass => serviceClass.name)
  )
  const redundantConfigurations = Object.keys(config.public.integrations)
    .filter(configName => configName !== 'default')
    .filter(configName => !serviceNames.has(configName))
  if (redundantConfigurations.length) {
    throw new RedundantCustomConfiguration(
      `Custom configurations found without a corresponding service: ${redundantConfigurations}`
    )
  }
}

module.exports = {
  RedundantCustomConfiguration,
  merge,
  checkCustomIntegrationConfiguration,
}
