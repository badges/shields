/**
 * @module
 */

import caller from 'caller'
import BaseService from '../base-service/base.js'
import ServiceTester from './service-tester.js'

/**
 * Automatically create a ServiceTester.
 *
 * When run from e.g. `gem-rank.tester.js`, this will create a tester that
 * attaches to the service found in `gem-rank.service.js`.
 *
 * This can't be used for `.service.js` files which export more than one
 * service.
 *
 * @returns {module:core/service-test-runner/service-tester~ServiceTester}
 *    ServiceTester instance
 */
async function createServiceTester() {
  const servicePath = caller().replace('.tester.js', '.service.js')
  const ServiceClass = Object.values(await import(servicePath))[0]
  if (!(ServiceClass.prototype instanceof BaseService)) {
    throw Error(
      `${servicePath} does not export a single service. Invoke new ServiceTester() directly.`
    )
  }
  return ServiceTester.forServiceClass(ServiceClass)
}

export default createServiceTester
