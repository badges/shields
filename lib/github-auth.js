// TODO:
// - document user authorization in try.html

var querystring = require('querystring');
var request = require('request');
var autosave = require('json-autosave');
var githubUserTokens = autosave('github-user-tokens.json', {data:[]});
var serverSecrets;
try {
  // Everything that cannot be checked in but is useful server-side
  // is stored in this JSON data.
  serverSecrets = require('../secret.json');
} catch(e) {}

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
    console.log(JSON.stringify(options));
    request.post(options, function(err, res, body) {
      if (err != null) { return end('The connection to GitHub failed'); }
      try {
        var content = querystring.parse(body);
      } catch(e) { return end('The GitHub OAuth token could not be parsed'); }
      var token = content.access_token;
      if (!token) {
        return end('The GitHub OAuth process did not return a user token');
      }
      console.log('GitHub OAuth: ' + token);

      // Send the token to all of those IPs.
      var ips = serverSecrets.shieldsIps;
      Promise.all(ips.map(function(ip) {
        return new Promise(function(resolve, reject) {
          var options = {
            uri: 'https://' + ip + '/github-auth/add-token',
            method: 'POST',
            form: {
              shieldsSecret: serverSecrets.shieldsSecret,
              token: token,
            },
          };
          request.post(options, function(err, res, body) {
            if (err != null) { return reject('Posting the GitHub user token failed'); }
            resolve();
          });
        });
      })).then(function() {
        end('Done!');
      });
    });
  });

  server.route(/^\/github-auth\/add-token$/, function(data, match, end, ask) {
    if (data.shieldsSecret !== serverSecrets.shieldsSecret) {
      // An unknown entity tries to connect. Let the connection linger for a minute.
      return setTimeout(function() { end('Invalid secret'); }, 60000);
    }
    githubUserTokens.data.push(data.token);
    end('Thanks!');
  });
};

exports.setRoutes = setRoutes;
