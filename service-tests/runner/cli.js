// Usage:
//
// Run all services:
//   npm run test:services
//
// Run some services:
//   npm run test:services -- --only=service1,service2,service3
//
// Infer the current PR from the Travis environment, and look for bracketed,
// space-separated service names in the pull request title. If none are found,
// do not run any tests. For example:
// Pull request title: [travis sonar] Support user token authentication
//   npm run test:services -- --pr
// is equivalent to
//   npm run test:services -- --only=travis,sonar

'use strict';

const difference = require('lodash.difference');
const request = require('request');
const minimist = require('minimist');
const Runner = require('./runner');
const githubAuth = require('./../../lib/github-auth.js');
const serverHelpers = require('../../lib/in-process-server-test-helpers');

function getTitle (repoSlug, pullRequest, callback) {
  const uri = `https://api.github.com/repos/${repoSlug}/pulls/${pullRequest}`;

  githubAuth.request(request, uri, {}, function(err, res, buffer) {
    if(res.statusCode==404){
      throw Error(`PR Not Found`);
    }

    var data = JSON.parse(buffer);

    callback(err,data.title);
  });
}

// [Travis] Fix timeout issues => ['travis']
// [Travis Sonar] Support user token authentication -> ['travis', 'sonar']
// [CRAN CPAN CTAN] Add test coverage => ['cran', 'cpan', 'ctan']
function servicesForTitle (title) {
  const matches = title.match(/\[([\w ]+)\]/);
  if (matches === null) {
    return [];
  }

  const services = matches[1].toLowerCase().split(' ');
  const blacklist = ['wip'];
  return difference(services, blacklist);
}

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

const args = minimist(process.argv.slice(3));
const prOption = args.pr;
const serviceOption = args.only;

if (prOption !== undefined) {
  const repoSlug = process.env.TRAVIS_REPO_SLUG;
  const pullRequest = process.env.TRAVIS_PULL_REQUEST;
  if (repoSlug === undefined || pullRequest === undefined) {
    console.error('Please set TRAVIS_REPO_SLUG and TRAVIS_PULL_REQUEST.');
    process.exit(-1);
  }
  console.info(`PR: ${repoSlug}#${pullRequest}`);

  getTitle(repoSlug, pullRequest,function(err,title){
    if(err){
      console.error(err);
      process.exit(1);
    }

    console.info(`Title: ${title}`);
    const services = servicesForTitle(title);
    if (services.length === 0) {
      console.info('No services found. Nothing to do.');
      process.exit(0);
    } else {
      console.info(`Services: (${services.length} found) ${services.join(', ')}\n`);
      runner.only(services);
      runner.toss();
      run();
    }
  });
} else {
  if (serviceOption !== undefined) {
    runner.only(serviceOption.split(','));
  }

  runner.toss();
  // Invoke run() asynchronously, because Mocha will not start otherwise.
  process.nextTick(run);
}
