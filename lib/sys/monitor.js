'use strict';

const secretIsValid = require('./secret-is-valid');
const serverSecrets = require('../server-secrets');
const log = require('../log');

function secretInvalid(req, res) {
  if (!secretIsValid(req.password)) {
    // An unknown entity tries to connect. Let the connection linger for a minute.
    setTimeout(function() {
      res.json({errors: [{code: 'invalid_secrets'}]});
    }, 10000);
    return true;
  }
  return false;
}

function setRoutes(server) {
  server.handle(function(req, res, next) {
    if (req.url.startsWith('/sys/')) {
      if (secretInvalid(req, res)) { return; }
    }
    next();
  });

  server.get('/sys/network', (req, res) => {
    res.json({ips: serverSecrets.shieldsIps});
  });

  server.ws('/sys/logs', socket => {
    const listener = (...msg) => socket.send(msg.join(' '));
    socket.on('close', () => log.removeListener(listener));
    socket.on('message', msg => {
      let req;
      try {
        req = JSON.parse(msg);
      } catch(e) { return; }
      if (!secretIsValid(req.secret)) {
        return socket.close();
      }
      log.addListener(listener);
    });
  });
}

module.exports = {
  setRoutes,
};
