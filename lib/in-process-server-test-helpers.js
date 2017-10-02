/**
 * Helpers to run a Shields server in process.
 *
 * Usage:
 * let server;
 * before('Start running the server', function () {
 *   this.timeout(5000);
 *   server = serverHelpers.start();
 * });
 * after('Shut down the server', function () { serverHelpers.stop(server); });
 */

'use strict';

const config = require('./test-config');

let startCalled = false;

/**
 * Start the server.
 *
 * @param {Number} port number (optional)
 * @return {Object} The scoutcamp instance
 */
function start () {
  if (startCalled) {
    throw Error('Because of the way Shields works, you can only use this ' +
      'once per node process. Once you call stop(), the game is over.');
  }
  startCalled = true;

  const originalArgv = process.argv;
  // Modifying argv during import is a bit dirty, but it works, and avoids
  // making bigger changes to server.js.
  process.argv = ['', '', config.port, 'localhost'];
  const server = require('../server');

  process.argv = originalArgv;
  return server;
}

/**
 * Reset the server, to avoid or reduce side effects between tests.
 *
 * @param {Object} server instance
 */
function reset (server) {
  server.reset();
}

/**
 * Stop the server.
 *
 * @param {Object} server instance
 */
function stop (server) {
  if (server) {
    server.camp.close();
  }
}

module.exports = {
  start,
  reset,
  stop
};
