'use strict'

const frisby = require('icedfrisby-nock')(require('icedfrisby'))
const config = require('../lib/test-config')

/**
 * Encapsulate a suite of tests. Create new tests using create() and register
 * them with Mocha using toss().
 */
class ServiceTester {
  /**
   * @param attrs { id, title, pathPrefix } The `id` is used to specify which
   *   tests to run from the CLI or pull requests. The `title` prints in the
   *   Mocha output. The `path` is the path prefix which is automatically
   *   prepended to each tested URI. The default is `/${attrs.id}`.
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
   * Invoked before each test. This is a stub which can be overridden on
   * instances.
   */
  beforeEach() {}

  /**
   * Create a new test. The hard work is delegated to IcedFrisby.
   * https://github.com/MarkHerhold/IcedFrisby/#show-me-some-code
   *
   * Note: The caller should not invoke toss() on the Frisby chain, as it's
   * invoked automatically by the tester.
   * @param msg The name of the test
   */
  create(msg) {
    const spec = frisby
      .create(msg)
      .baseUri(`http://localhost:${config.port}${this.pathPrefix}`)
      .before(() => {
        this.beforeEach()
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
   */
  toss() {
    const specs = this.specs

    const fn = this._only ? describe.only : describe
    // eslint-disable-next-line mocha/prefer-arrow-callback
    fn(this.title, function() {
      specs.forEach(spec => {
        spec.toss()
      })
    })
  }
}
module.exports = ServiceTester
