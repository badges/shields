/**
 * Helpers to run a Shields server in process.
 *
 * Because of the way Shields works, you can only use these once per node
 * process. Once you call stop(), the game is over.
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

const config = require('./config');

/**
 * Start the server.
 *
 * @param {Number} port number (optional)
 * @return {Object} The scoutcamp instance
 */
const start = () => {
  const originalArgv = process.argv;
  // Modifying argv during import is a bit dirty, but it works, and avoids
  // making bigger changes to server.js.
  process.argv = ['', '', config.port, 'localhost'];
  const server = require('../server');

  process.argv = originalArgv;
  return server;
};

/**
 * Reset the server, to avoid or reduce side effects between tests.
 *
 * @param {Object} server instance
 */
const reset = server => { server.requestCache.clear(); };

/**
 * Stop the server.
 *
 * @param {Object} server instance
 */
const stop = server => {
  if (server) {
    server.camp.close();
  }
};

module.exports = {
  start,
  reset,
  stop
};
