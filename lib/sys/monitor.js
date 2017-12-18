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

const ipHits = new Map();  // Map from IPs to the number of hits.
const ipPeriod = 300;  // 5 min, in seconds
const maxHitsPerPeriod = 300;
const bannedIps = new Set();
const bannedIpUrls = new Set();
function resetIpHits() { ipHits.clear(); bannedIps.clear(); bannedIpUrls.clear(); }
setInterval(resetIpHits, ipPeriod * 1000);

const whitelist = /^192\.30\.252\.\d+$/;  // GitHub
const referrerWhitelist = /^https?:\/\/shields\.io\/$/;

function setRoutes(server) {
  server.handle(function monitorHandler(req, res, next) {
    if (req.url.startsWith('/sys/')) {
      if (secretInvalid(req, res)) { return; }
    }

    const ip = (req.headers['x-forwarded-for'] || '').split(', ')[0]
      || req.socket.remoteAddress;
    //const badgeType = req.url.split(/[\/-]/).slice(0, 3).join('');
    const referrer = req.headers['referer'];
    const ipHitsInCurrentPeriod = ipHits.get(referrer) || 0;
    if ((!!referrer && !referrerWhitelist.test(referrer))
      && ipHitsInCurrentPeriod > maxHitsPerPeriod
      && !whitelist.test(ip)) { bannedIps.add(referrer); }
    if (bannedIps.has(referrer)) {
      res.statusCode = 429;
      res.setHeader('Retry-After', String(ipPeriod));
      res.end(`Exceeded limit ${maxHitsPerPeriod} requests ` +
        `per ${ipPeriod} seconds`);
      bannedIpUrls.add(req.url);
      return;
    }
    ipHits.set(referrer, ipHitsInCurrentPeriod + 1);

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

  server.get('/sys/banned', (req, res) => {
    res.json({ips: [...bannedIps], hits: [...ipHits], urls: [...bannedIpUrls]})
  });
}

module.exports = {
  setRoutes,
};
