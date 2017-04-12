'use strict';

const glob = require('glob');
const config = require('./config');
const minimist = require('minimist');
const uniq = require('lodash.uniq');

let server;
before('Start the server', function () {
  this.timeout(5000);
  // Modifying argv is a bit dirty, but it works, and avoids making bigger
  // changes to server.js.
  process.argv = ['', '', config.port, 'localhost'];
  server = require('../../server');
});
after('Shut down the server', function (done) {
  server.camp.close(function () { done(); });
});

const testers = glob.sync(`${__dirname}/../*.js`).map(specPath => {
  const tester = require(specPath);

  // The server's request cache causes side effects between tests.
  tester.beforeEach = () => { server.requestCache.clear(); };

  return tester;
});

const testerWithName = name => testers.find(t => t.name.toLowerCase() === name);

// e.g. mocha runner.js --only=vendor1,vendor2,vendor3
const vendorOption = minimist(process.argv.slice(2)).only;
if (vendorOption !== undefined) {
  const vendors = uniq(vendorOption.split(',')).map(v => v.toLowerCase());

  const missingVendors = [];
  vendors.forEach(vendor => {
    if (!testerWithName(vendor)) {
      missingVendors.push(vendor);
    }
  });

  if (missingVendors.length) {
    console.error('Unknown vendors:', missingVendors.join(', '));
    process.exit(-1);
  }

  // Make a second pass through the testers to make sure we've gotten them
  // all.
  testers.forEach(tester => {
    if (vendors.includes(tester.name.toLowerCase())) {
      tester.only();
    }
  });
}

testers.forEach(tester => {
  tester.toss();
});
