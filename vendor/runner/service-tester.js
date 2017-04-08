'use strict';

const frisby = require('./icedfrisby-nock')(require('icedfrisby'));
const config = require('./config');

class ServiceTester {
  constructor (name, pathPrefix) {
    Object.assign(this, { name, pathPrefix });

    this.specs = [];
  }

  // Stub which can be overridden on instances.
  beforeEach () {}

  // Create a new spec. The hard work is delegated to IcedFrisby.
  // https://github.com/MarkHerhold/IcedFrisby/#show-me-some-code
  //
  // Note: Do not invoke toss().
  //
  // @param msg The name of the test
  create (msg) {
    const spec = frisby.create(msg)
      .baseUri(`http://localhost:${config.port}${this.pathPrefix}`)
      .before(() => { this.beforeEach(); });

    this.specs.push(spec);

    return spec;
  }

  // Queue up the tests.
  toss () {
    const specs = this.specs;

    describe(this.name, function () {
      specs.forEach(spec => { spec.toss(); });
    });
  }
}
module.exports = ServiceTester;
