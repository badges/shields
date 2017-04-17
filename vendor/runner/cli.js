'use strict';

const minimist = require('minimist');
const serverHelpers = require('../../test/in-process-server-helpers');
const Runner = require('./runner');

let server;
before('Start running the server', function () {
  this.timeout(5000);
  server = serverHelpers.start();
});
after('Shut down the server', function () { serverHelpers.stop(server); });

// e.g. mocha runner.js --only=vendor1,vendor2,vendor3
const vendorOption = minimist(process.argv.slice(2)).only;

const runner = new Runner();
runner.prepare();
// The server's request cache causes side effects between tests.
runner.beforeEach = () => { serverHelpers.reset(server); };

if (vendorOption !== undefined) {
  runner.only(vendorOption);
}

runner.toss();
