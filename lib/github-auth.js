// TODO:
// - document user authorization in try.html

var querystring = require('querystring');
var request = require('request');
var autosave = require('json-autosave');
var serverSecrets;
try {
  // Everything that cannot be checked in but is useful server-side
  // is stored in this JSON data.
  serverSecrets = require('../secret.json');
} catch(e) {}
var githubUserTokens;
autosave('github-user-tokens.json', {data:[]}).then(function(f) {
  githubUserTokens = f;
}).catch(function(e) { console.error('Could not create github-user-tokens.json'); });

function setRoutes(server) {
  server.route(/^\/github-auth$/, function(data, match, end, ask) {
    if (!(serverSecrets && serverSecrets.gh_client_id)) {
      return end('This server is missing GitHub client secrets');
    }
    var query = querystring.stringify({
      client_id: serverSecrets.gh_client_id,
      redirect_uri: 'https://img.shields.io/github-auth/done',
    });
    ask.res.statusCode = 302;  // Found.
    ask.res.setHeader('Location', 'https://github.com/login/oauth/authorize?' + query);
    end('');
  });

  server.route(/^\/github-auth\/done$/, function(data, match, end, ask) {
    if (!(serverSecrets && serverSecrets.gh_client_id && serverSecrets.gh_client_secret)) {
      return end('This server is missing GitHub client secrets');
    }
    if (!data.code) {
      return end('GitHub OAuth authentication failed to provide a code');
    }
    var options = {
      url: 'https://github.com/login/oauth/access_token',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'User-Agent': 'Shields.io',
      },
      form: querystring.stringify({
        client_id: serverSecrets.gh_client_id,
        client_secret: serverSecrets.gh_client_secret,
        code: data.code,
      }),
      method: 'POST',
    };
    request(options, function(err, res, body) {
      if (err != null) { return end('The connection to GitHub failed'); }
      try {
        var content = querystring.parse(body);
      } catch(e) { return end('The GitHub OAuth token could not be parsed'); }
      var token = content.access_token;
      if (!token) {
        return end('The GitHub OAuth process did not return a user token');
      }
      console.log('GitHub OAuth: ' + token);

      end('Done!');

      sendTokenToAllServers(token)
      .catch(function(e) {
        console.error('GitHub user token transmission failed:', e);
      });
    });
  });

  server.route(/^\/github-auth\/add-token$/, function(data, match, end, ask) {
    console.log('GitHub add token called with', JSON.stringify(data));
    if (data.shieldsSecret !== serverSecrets.shieldsSecret) {
      // An unknown entity tries to connect. Let the connection linger for a minute.
      return setTimeout(function() { end('Invalid secret'); }, 60000);
    }
    // Insert it only if it is not registered yet.
    if (githubUserTokens.data.indexOf(data.token) === -1) {
      githubUserTokens.data.push(data.token);
    }
    end('Thanks!');
  });
};

function sendTokenToAllServers(token) {
  var ips = serverSecrets.shieldsIps;
  return Promise.all(ips.map(function(ip) {
    return new Promise(function(resolve, reject) {
      var options = {
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
        if (err != null) { return reject('Posting the GitHub user token failed: ' + err.stack); }
        resolve();
      });
    });
  }));
}

exports.setRoutes = setRoutes;
