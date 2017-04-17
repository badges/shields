'use strict';

const glob = require('glob');
const uniq = require('lodash.uniq');

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
    this.testers = glob.sync(`${__dirname}/../*.js`).map(require);
    this.testers.forEach(tester => {
      tester.beforeEach = () => { this.beforeEach(); };
    });
  }

  _testersWithVendor (vendor) {
    return this.testers.filter(t => t.name.toLowerCase() === vendor);
  }

  /**
   * Limit the test run to the specified vendors.
   *
   * @param vendors An array of vendor names to run
   */
  only (vendors) {
    const normalizedVendors = uniq(vendors.map(v => v.toLowerCase()));

    const missingVendors = [];
    normalizedVendors.forEach(vendor => {
      const testers = this._testersWithVendor(vendor);

      if (testers.length === 0) {
        missingVendors.push(vendor);
      }

      testers.forEach(tester => { tester.only(); });
    });

    // Throw at the end, to provide a better error message.
    if (missingVendors.length > 0) {
      throw Error('Unknown vendors: ' + missingVendors.join(', '));
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
