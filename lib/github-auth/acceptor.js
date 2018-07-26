'use strict';

const request = require('request');
const queryString = require('query-string');
const serverSecrets = require('../server-secrets');
const log = require('../log');

function sendTokenToAllServers(token) {
  const ips = serverSecrets.shieldsIps;
  return Promise.all(ips.map(function(ip) {
    return new Promise(function(resolve, reject) {
      const options = {
        url: 'https://' + ip + '/github-auth/add-token',
        method: 'POST',
        form: {
          shieldsSecret: serverSecrets.shieldsSecret,
          token: token,
        },
        // We target servers by IP, and we use HTTPS. Assuming that
        // 1. Internet routers aren't hacked, and
        // 2. We don't unknowingly lose our IP to someone else,
        // we're not leaking people's and our information.
        // (If we did, it would have no impact, as we only ask for a token,
        // no GitHub scope. The malicious entity would only be able to use
        // our rate limit pool.)
        // FIXME: use letsencrypt.
        strictSSL: false,
      };
      request(options, function(err, res, body) {
        if (err != null) { return reject(err); }
        resolve();
      });
    });
  }));
}

function constEq(a, b) {
  if (a.length !== b.length) { return false; }
  let zero = 0;
  for (let i = 0; i < a.length; i++) {
    zero |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return (zero === 0);
}

function setRoutes(tokenProvider, server) {
  const baseUrl = process.env.BASE_URL || 'https://img.shields.io';

  server.route(/^\/github-auth$/, function(data, match, end, ask) {
    if (!(serverSecrets && serverSecrets.gh_client_id)) {
      return end('This server is missing GitHub client secrets.');
    }
    const query = queryString.stringify({
      client_id: serverSecrets.gh_client_id,
      redirect_uri: baseUrl + '/github-auth/done',
    });
    ask.res.statusCode = 302;  // Found.
    ask.res.setHeader('Location', 'https://github.com/login/oauth/authorize?' + query);
    end('');
  });

  server.route(/^\/github-auth\/done$/, function(data, match, end, ask) {
    if (!(serverSecrets && serverSecrets.gh_client_id && serverSecrets.gh_client_secret)) {
      return end('This server is missing GitHub client secrets.');
    }
    if (!data.code) {
      log(`GitHub OAuth data.code: ${JSON.stringify(data)}`);
      return end('GitHub OAuth authentication failed to provide a code.');
    }
    const options = {
      url: 'https://github.com/login/oauth/access_token',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'User-Agent': 'Shields.io',
      },
      form: queryString.stringify({
        client_id: serverSecrets.gh_client_id,
        client_secret: serverSecrets.gh_client_secret,
        code: data.code,
      }),
      method: 'POST',
    };
    request(options, function(err, res, body) {
      if (err != null) { return end('The connection to GitHub failed.'); }
      let content;
      try {
        content = queryString.parse(body);
      } catch(e) { return end('The GitHub OAuth token could not be parsed.'); }
      const token = content.access_token;
      if (!token) {
        return end('The GitHub OAuth process did not return a user token.');
      }

      ask.res.setHeader('Content-Type', 'text/html');
      end('<p>Shields.io has received your app-specific GitHub user token. ' +
          'You can revoke it by going to ' +
          '<a href="https://github.com/settings/applications">GitHub</a>.</p>' +
          '<p>Until you do, you have now increased the rate limit for GitHub ' +
          'requests going through Shields.io. GitHub-related badges are ' +
          'therefore more robust.</p>' +
          '<p>Thanks for contributing to a smoother experience for ' +
          'everyone!</p>' +
          '<p><a href="/">Back to the website</a></p>');

      sendTokenToAllServers(token)
      .catch(function(e) {
        console.error('GitHub user token transmission failed:', e);
      });
    });
  });

  // Internal route, used by other shields servers.
  server.route(/^\/github-auth\/add-token$/, function(data, match, end, ask) {
    if (!constEq(data.shieldsSecret, serverSecrets.shieldsSecret)) {
      // An unknown entity tries to connect. Let the connection linger for 10s.
      return setTimeout(function() { end('Invalid secret.'); }, 10000);
    }
    tokenProvider.addToken(data.token);
    end('Thanks!');
  });
}

module.exports = {
  setRoutes,
};
