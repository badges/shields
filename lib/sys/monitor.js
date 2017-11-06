const secretIsValid = require('./secret-is-valid');
const serverSecrets = require('../server-secrets');

function setRoutes(server) {
  server.get('/sys/network', (req, res) => {
    if (!secretIsValid(req.password)) {
      // An unknown entity tries to connect. Let the connection linger for a minute.
      return setTimeout(function() {
        res.end(JSON.stringify({errors: [{code: 'invalid_secrets'}]}));
      }, 10000);
    }
    res.end(JSON.stringify({ips: serverSecrets.shieldsIps}));
  });
}

module.exports = {
  setRoutes,
};
