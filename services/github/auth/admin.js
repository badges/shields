'use strict';

const crypto = require('crypto');
const { serializeDebugInfo } = require('../../../lib/github-auth');
const serverSecrets = require('../../../lib/server-secrets');

function setRoutes(server) {
  // Allow the admin to obtain the tokens for operational and debugging
  // purposes. This could be used to:
  //
  // - Ensure tokens have been propagated to all servers
  // - Debug GitHub badge failures
  //
  // The admin can authenticate with HTTP Basic Auth, with an empty/any
  // username and the shields secret in the password and an empty/any
  // password.
  //
  // e.g.
  // curl -u ':very-very-secret' 'https://example.com/$github-auth/tokens'
  server.ajax.on('github-auth/tokens', (json, end, ask) => {
    if (!crypto.timingSafeEqual(ask.password, serverSecrets.shieldsSecret)) {
      // An unknown entity tries to connect. Let the connection linger for a minute.
      return setTimeout(function() {
        end('Invalid secret.');
      }, 10000);
    }
    end(serializeDebugInfo({ sanitize: false }));
  });
}

module.exports = {
  setRoutes,
};
