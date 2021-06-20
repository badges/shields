/**
 * @module
 */

import emojic from 'emojic'
import icedfrisbyNockModule from 'icedfrisby-nock'
import icedfrisbyModule from 'icedfrisby'
import trace from '../base-service/trace.js'
import icedfrisbyShieldsModule from './icedfrisby-shields.js'
const frisby = icedfrisbyShieldsModule(icedfrisbyNockModule(icedfrisbyModule))

/**
 * Encapsulate a suite of tests. Create new tests using create() and register
 * them with Mocha using toss().
 *
 * @see https://github.com/badges/shields/blob/master/doc/service-tests.md
 */
class ServiceTester {
  /**
   * Service Tester Constructor
   *
   * @param {object} attrs Refer to individual attrs
   * @param {string} attrs.id
   *    Specifies which tests to run from the CLI or pull requests
   * @param {string} attrs.title
   *    Prints in the Mocha output
   * @param {string} attrs.pathPrefix
   *    Prefix which is automatically prepended to each tested URI.
   *    The default is `/${attrs.id}`.
   */
  constructor({ id, title, pathPrefix }) {
    if (pathPrefix === undefined) {
      pathPrefix = `/${id}`
    }
    Object.assign(this, {
      id,
      title,
      pathPrefix,
      specs: [],
      _only: false,
    })
  }

  /**
   * Construct a ServiceTester instance for a single service class
   *
   * @param {Function} ServiceClass
   *    A class that extends base-service/base.BaseService
   * @returns {module:core/service-test-runner/service-tester~ServiceTester}
   *    ServiceTester for ServiceClass
   */
  static forServiceClass(ServiceClass) {
    const id = ServiceClass.name
    const pathPrefix = ServiceClass.route.base
      ? `/${ServiceClass.route.base}`
      : ''
    return new this({
      id,
      title: id,
      pathPrefix,
    })
  }

  /**
   * Invoked before each test. This is a stub which can be overridden on
   * instances.
   */
  beforeEach() {}

  /**
   * Create a new test. The hard work is delegated to IcedFrisby.
   * {@link https://github.com/MarkHerhold/IcedFrisby/#show-me-some-code}
   *
   * Note: The caller should not invoke toss() on the Frisby chain, as it's
   * invoked automatically by the tester.
   *
   * @param {string} msg The name of the test
   * @returns {module:icedfrisby~IcedFrisby} IcedFrisby instance
   */
  create(msg) {
    const spec = frisby
      .create(msg)
      .before(() => {
        this.beforeEach()
      })
      // eslint-disable-next-line mocha/prefer-arrow-callback, promise/prefer-await-to-then
      .finally(function () {
        // `this` is the IcedFrisby instance.
        let responseBody
        try {
          responseBody = JSON.parse(this._response.body)
        } catch (e) {
          responseBody = this._response.body
        }
        trace.logTrace('outbound', emojic.shield, 'Response', responseBody)
      })

    this.specs.push(spec)

    return spec
  }

  /**
   * Run only this tester. This can be invoked using the --only argument to
   * the CLI, or directly on the tester.
   */
  only() {
    this._only = true
  }

  /**
   * Register the tests with Mocha.
   *
   * @param {object} attrs Refer to individual attrs
   * @param {string} attrs.baseUrl base URL for test server
   * @param {boolean} attrs.skipIntercepted skip tests which intercept requests
   * @param {object} attrs.retry retry configuration
   * @param {number} attrs.retry.count number of times to retry test
   * @param {number} attrs.retry.backoff number of milliseconds to add to the wait between each retry
   */
  toss({ baseUrl, skipIntercepted, retry: { count, backoff } }) {
    const { specs, pathPrefix } = this
    const testerBaseUrl = `${baseUrl}${pathPrefix}`

    const fn = this._only ? describe.only : describe
    // eslint-disable-next-line mocha/prefer-arrow-callback
    fn(this.title, function () {
      specs.forEach(spec => {
        spec._message = `[${spec.hasIntercept ? 'mocked' : 'live'}] ${
          spec._message
        }`
        if (!skipIntercepted || !spec.intercepted) {
          spec.baseUri(testerBaseUrl)
          spec.retry(count, backoff)
          spec.toss()
        }
      })
    })
  }
}

export default ServiceTester
