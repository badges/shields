// Usage:
//
// Run all services:
//   npm run test:services
//
// Run some services:
//   npm run test:services -- --only=service1,service2,service3
//
// Alternatively, pass a newline-separated list of services to stdin.
//   echo "service1\nservice2\nservice3" | npm run test:services -- --stdin
//

'use strict';

const minimist = require('minimist');
const readlineSync = require('readline-sync');
const readAllStdinSync = require('read-all-stdin-sync');
const Runner = require('./runner');
const serverHelpers = require('../../lib/in-process-server-test-helpers');

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
const stdinOption = args.stdin;
const onlyOption = args.only;

let onlyServices;

if (stdinOption && onlyOption) {
  console.error('Do not use --only with --stdin');
} else if (stdinOption) {
  const allStdin = readAllStdinSync().trim();
  onlyServices = allStdin ? allStdin.split('\n') : [];
} else if (onlyOption) {
  onlyServices = onlyOption.split(',');
}

if (typeof onlyServices === 'undefined') {
  console.info('Running all service tests.');
} else if (onlyServices.length === 0) {
  console.info('No service tests to run. Exiting.');
  process.exit(0);
} else {
  console.info(`Running tests for ${onlyServices.length} services: ${onlyServices.join(', ')}.\n`);
  runner.only(onlyServices);
}

runner.toss();
// Invoke run() asynchronously, because Mocha will not start otherwise.
process.nextTick(run);
