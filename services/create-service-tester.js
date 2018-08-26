'use strict'

const caller = require('caller')
const ServiceTester = require('./service-tester')
const BaseService = require('./base')

// Automatically create a ServiceTester. When run from e.g.
// `gem-rank.tester.js`, this will create a tester that attaches to the
// service found in `gem-rank.service.js`.
//
// This can't be used for `.service.js` files which export more than one
// service.
function createServiceTester() {
  const servicePath = caller().replace('.tester.js', '.service.js')
  let ServiceClass
  try {
    ServiceClass = require(servicePath)
  } catch (e) {
    throw Error(`Couldn't load service from ${servicePath}`)
  }
  if (!(ServiceClass.prototype instanceof BaseService)) {
    throw Error(
      `${servicePath} does not export a single service. Invoke new ServiceTester() directly.`
    )
  }
  return ServiceTester.forServiceClass(ServiceClass)
}

module.exports = createServiceTester
