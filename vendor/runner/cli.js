// Usage:
//
// Run all vendors:
//   npm run test:vendor
//
// Run some vendors:
//   npm run test:vendor -- --only=vendor1,vendor2,vendor3
//
// Infer the current PR from the Travis environment, and look for bracketed,
// space-separated vendor names in the pull request title. If none are found,
// do not run any tests. For example:
// Pull request title: [travis sonar] Support user token authentication
//   npm run test:vendor -- --pr
// is equivalent to
//   npm run test:vendor -- --only=travis,sonar

'use strict';

const request = require('request');
const minimist = require('minimist');
const difference = require('lodash.difference');
const serverHelpers = require('../../test/in-process-server-helpers');
const Runner = require('./runner');

const getTitle = (repoSlug, pullRequest) => new Promise((resolve, reject) => {
  const options = {
    uri: `https://api.github.com/repos/${repoSlug}/pulls/${pullRequest}`,
    json: true,
    headers: { 'User-Agent': 'badges/shields' },
  };
  request(options, (err, res, json) => {
    if (err !== null) {
      reject(err);
    } else if (res.statusCode !== 200) {
      reject(Error(`Status code ${res.statusCode}`));
    } else {
      resolve(json.title);
    }
  });
});

const vendorsForTitle = title => {
  const matches = title.match(/\[([\w ]+)\]/);
  if (matches === null) {
    return [];
  }

  const vendors = matches[1].toLowerCase().split(' ');
  const blacklist = ['wip'];
  return difference(vendors, blacklist);
};

let server;
before('Start running the server', function () {
  this.timeout(5000);
  server = serverHelpers.start();
});
after('Shut down the server', function () { serverHelpers.stop(server); });

const runner = new Runner();
runner.prepare();
// The server's request cache causes side effects between tests.
runner.beforeEach = () => { serverHelpers.reset(server); };

const prOption = minimist(process.argv.slice(3)).pr;
const vendorOption = minimist(process.argv.slice(3)).only;

if (prOption !== undefined) {
  const repoSlug = process.env.TRAVIS_REPO_SLUG;
  const pullRequest = process.env.TRAVIS_PULL_REQUEST;
  if (repoSlug === undefined || pullRequest === undefined) {
    console.error('Please set TRAVIS_REPO_SLUG and TRAVIS_PULL_REQUEST.');
    process.exit(-1);
  }
  console.info(`PR: ${repoSlug}#${pullRequest}`);

  getTitle(repoSlug, pullRequest)
    .then(title => {
      console.info(`Title: ${title}`);
      const vendors = vendorsForTitle(title);
      if (vendors.length === 0) {
        console.info('No vendors found. Nothing to do.');
      } else {
        console.info(`Vendors: (${vendors.length} found) ${vendors.join(', ')}\n`);
        runner.only(vendors);
        runner.toss();
        run();
      }
    }).catch(err => {
      console.error(err);
      process.exit(1);
    });
} else {
  if (vendorOption !== undefined) {
    runner.only(vendorOption.split(','));
  }

  runner.toss();
  // Invoke run() asynchronously, beacuse Mocha will not start otherwise.
  process.nextTick(run);
}
