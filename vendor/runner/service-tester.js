'use strict';

const frisby = require('./icedfrisby-nock')(require('icedfrisby'));
const config = require('./config');

class ServiceTester {
  constructor (name, pathPrefix) {
    Object.assign(this, { name, pathPrefix });

    this.specs = [];
    this.only = false;
  }

  // Stub which can be overridden on instances.
  beforeEach () {}

  // Create a new spec. The hard work is delegated to IcedFrisby.
  // https://github.com/MarkHerhold/IcedFrisby/#show-me-some-code
  //
  // Note: The caller should not invoke toss() on the Frisby chain. Just call
  // toss() on the _tester_, which tosses all tests.
  //
  // @param msg The name of the test
  create (msg) {
    const spec = frisby.create(msg)
      .baseUri(`http://localhost:${config.port}${this.pathPrefix}`)
      .before(() => { this.beforeEach(); });

    this.specs.push(spec);

    return spec;
  }

  // Run only this tester.
  // See https://mochajs.org/#exclusive-tests
  only () {
    this.only = true;
  }

  // Queue up the tests.
  toss () {
    const specs = this.specs;

    const fn = this.only ? describe.only : describe;
    fn(this.name, function () {
      specs.forEach(spec => { spec.toss(); });
    });
  }
}
module.exports = ServiceTester;
