'use strict';

const glob = require('glob');
const uniq = require('lodash.uniq');

class Runner {
  constructor () {
    this.testers = null;
  }

  // Stub which can be overridden on instances.
  beforeEach () {}

  prepare () {
    this.testers = glob.sync(`${__dirname}/../*.js`).map(require);
    this.testers.forEach(tester => {
      tester.beforeEach = () => { this.beforeEach(); };
    });
  }

  _testersWithVendor (vendor) {
    return vendor => this.testers.filter(t => t.name.toLowerCase() === vendor);
  }

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

  toss() {
    this.testers.forEach(tester => { tester.toss(); });
  }
}
module.exports = Runner;
