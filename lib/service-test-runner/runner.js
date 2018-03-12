'use strict';

const glob = require('glob');

/**
 * Load a collection of ServiceTester objects and register them with Mocha.
 */
class Runner {
  /**
   * Function to invoke before each test. This is a stub which can be
   * overridden on instances.
   */
  beforeEach () {}

  /**
   * Prepare the runner by loading up all the ServiceTester objects.
   */
  prepare () {
    this.testers = glob.sync(`${__dirname}/../../services/**/*.tester.js`).map(name => require(name));
    this.testers.forEach(tester => {
      tester.beforeEach = () => { this.beforeEach(); };
    });
  }

  _testersForService (service) {
    return this.testers.filter(t => t.id.toLowerCase() === service);
  }

  /**
   * Limit the test run to the specified services.
   *
   * @param services An array of service ids to run
   */
  only (services) {
    const normalizedServices = new Set(services.map(v => v.toLowerCase()));

    const missingServices = [];
    normalizedServices.forEach(service => {
      const testers = this._testersForService(service);

      if (testers.length === 0) {
        missingServices.push(service);
      }

      testers.forEach(tester => { tester.only(); });
    });

    // Throw at the end, to provide a better error message.
    if (missingServices.length > 0) {
      throw Error('Unknown services: ' + missingServices.join(', '));
    }
  }

  /**
   * Register the tests with Mocha.
   */
  toss () {
    this.testers.forEach(tester => { tester.toss(); });
  }
}
module.exports = Runner;
