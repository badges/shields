'use strict';

const glob = require('glob');
const config = require('./config');
const minimist = require('minimist');
const uniq = require('lodash.uniq');

let server;
before('Start running the server', function () {
  this.timeout(5000);
  // This is a bit gross, but it works.
  process.argv = ['', '', config.port, 'localhost'];
  server = require('../../server');
});
after('Shut down the server', function (done) {
  server.camp.close(function () { done(); });
});

const testers = glob.sync(`${__dirname}/../*.js`).map(specPath => {
  const tester = require(specPath);
  tester.beforeEach = () => { server.requestCache.clear(); };
  return tester;
});

const testerWithName = name =>
  testers.find(t => t.name.toLowerCase() === name.toLowerCase());

// mocha runner.js --only=vendor1,vendor2,vendor3
const vendorOption = minimist(process.argv.slice(2)).only;
if (vendorOption !== undefined) {
  const vendors = uniq(vendorOption.split(','));

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

  testers.forEach(tester => {
    if (vendors.includes(tester.name)) {
      tester.only();
    }
  });
}

testers.forEach(tester => {
  tester.toss();
});
