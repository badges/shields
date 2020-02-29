'use strict'
/**
 * @module
 */

const path = require('path')
const { loadTesters } = require('../base-service/loader')

/**
 * Load a collection of ServiceTester objects and register them with Mocha.
 */
class Runner {
  constructor({ baseUrl, skipIntercepted, retry }) {
    this.baseUrl = baseUrl
    this.skipIntercepted = skipIntercepted
    this.retry = retry
  }

  /**
   * Function to invoke before each test. This is a stub which can be
   * overridden on instances.
   */
  beforeEach() {}

  /**
   * Prepare the runner by loading up all the ServiceTester objects.
   */
  prepare() {
    this.testers = loadTesters()
    this.testers.forEach(tester => {
      tester.beforeEach = () => {
        this.beforeEach()
      }
    })
  }

  _testersForService(service) {
    return this.testers.filter(t => t.id.toLowerCase().startsWith(service))
  }

  /**
   * Limit the test run to the specified services.
   *
   * @param {string[]} services An array of service id prefixes to run
   */
  only(services) {
    const normalizedServices = new Set(services.map(v => v.toLowerCase()))

    const missingServices = []
    normalizedServices.forEach(service => {
      const testers = this._testersForService(service)

      if (testers.length === 0) {
        missingServices.push(service)
      }

      testers.forEach(tester => {
        tester.only()
      })
    })

    // Throw at the end, to provide a better error message.
    if (missingServices.length > 0) {
      throw Error(`Unknown services: ${missingServices.join(', ')}`)
    }
  }

  /**
   * Limit the test run to the specified badges of a service.
   *
   * @param {string} service The service to run
   * @param {string[]} badges An array of badge ids to run
   */
  onlyBadges(service, badges) {
    service = service.toLowerCase()

    const testers = this._testersForService(service)
    if (testers.length === 0) {
      throw Error(`Unknown service: ${service}`)
    }

    const normalizedBadges = new Set(
      badges.map(badge => {
        badge = badge.toLowerCase()
        if (service !== badge) {
          badge = `${service}-${badge}`
        }
        return badge
      })
    )

    testers.forEach(tester => {
      const file = path.basename(tester.absolutePath)
      const badgeName = file.substr(0, file.indexOf('.'))
      if (normalizedBadges.delete(badgeName)) {
        tester.only()
      }
    })

    // Throw at the end, to provide a better error message.
    if (normalizedBadges.size > 0) {
      // Removes the service name prefix prepended earlier.
      const originalBadges = Array.from(normalizedBadges).map(v =>
        v === service ? v : v.substr(service.length + 1)
      )

      throw Error(
        `Unknown badges of service ${service}: ${originalBadges.join(', ')}`
      )
    }
  }

  /**
   * Register the tests with Mocha.
   */
  toss() {
    const { testers, baseUrl, skipIntercepted, retry } = this
    testers.forEach(tester => tester.toss({ baseUrl, skipIntercepted, retry }))
  }
}
module.exports = Runner
