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
var githubUserTokensFile = '.github-user-tokens.json';
autosave(githubUserTokensFile, {data:[]}).then(function(f) {
  githubUserTokens = f;
  for (var i = 0; i < githubUserTokens.data.length; i++) {
    addGithubToken(githubUserTokens.data[i]);
  }
}).catch(function(e) { console.error('Could not create ' + githubUserTokensFile); });

function setRoutes(server) {
  server.route(/^\/github-auth$/, function(data, match, end, ask) {
    if (!(serverSecrets && serverSecrets.gh_client_id)) {
      return end('This server is missing GitHub client secrets.');
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
      return end('This server is missing GitHub client secrets.');
    }
    if (!data.code) {
      return end('GitHub OAuth authentication failed to provide a code.');
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
      if (err != null) { return end('The connection to GitHub failed.'); }
      try {
        var content = querystring.parse(body);
      } catch(e) { return end('The GitHub OAuth token could not be parsed.'); }
      var token = content.access_token;
      if (!token) {
        return end('The GitHub OAuth process did not return a user token.');
      }
      console.log('GitHub OAuth: ' + token);

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

  server.route(/^\/github-auth\/add-token$/, function(data, match, end, ask) {
    console.log('GitHub add token called with', JSON.stringify(data));
    if (data.shieldsSecret !== serverSecrets.shieldsSecret) {
      // An unknown entity tries to connect. Let the connection linger for a minute.
      return setTimeout(function() { end('Invalid secret.'); }, 60000);
    }
    addGithubToken(data.token);
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

// Track rate limit requests remaining.

// Ideally, we would want priority queues here.
var reqRemaining = new Map();  // From token to requests remaining.
var reqReset = new Map();  // From token to timestamp.

// token: client token as a string.
// reqs: number of requests remaining.
// reset: timestamp when the number of remaining requests is reset.
function setReqRemaining(token, reqs, reset) {
  reqRemaining.set(token, reqs);
  reqReset.set(token, reset);
}

function rmReqRemaining(token) {
  reqRemaining.delete(token);
  reqReset.delete(token);
}

function utcEpochSeconds() {
  return ((Date.now() / 1000) >>> 0);
}

var userTokenRateLimit = 12500;

// Return false if the token cannot reasonably be expected to perform
// a GitHub request.
function isTokenUsable(token, now) {
  var reqs = reqRemaining.get(token);
  var reset = reqReset.get(token);
  // We don't want to empty more than 3/4 of a user's rate limit.
  var hasRemainingReqs = reqs > (userTokenRateLimit / 4);
  var isBeyondRateLimitReset = reset < now;
  return hasRemainingReqs || isBeyondRateLimitReset;
}

// Return a list of tokens (as strings) which can be used for a GitHub request,
// with a reasonable chance that the request will succeed.
function usableTokens() {
  var now = utcEpochSeconds();
  return githubUserTokens.data.filter(function(token) {
    return isTokenUsable(token, now);
  });
}

// Retrieve a user token if there is one for which we believe there are requests
// remaining. Return undefined if we could not find one.
function getReqRemainingToken() {
  // Go through the user tokens.
  // Among usable ones, use the one with the highest number of remaining
  // requests.
  var tokens = usableTokens();
  var highestReq = -1;
  var highestToken;
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    var reqs = reqRemaining.get(token);
    if (reqs > highestReq) {
      highestReq = reqs;
      highestToken = token;
    }
  }
  return highestToken;
}

function addGithubToken(token) {
  // A reset date of 0 has to be in the past.
  setReqRemaining(token, userTokenRateLimit, 0);
  // Insert it only if it is not registered yet.
  if (githubUserTokens.data.indexOf(token) === -1) {
    githubUserTokens.data.push(token);
  }
}

function rmGithubToken(token) {
  rmReqRemaining(token);
  // Remove it only if it is in there.
  var idx = githubUserTokens.data.indexOf(token);
  if (idx >= 0) {
    githubUserTokens.data.splice(idx, 1);
  }
}

// Personal tokens allow access to GitHub private repositories.
// You can manage your personal GitHub token at
// <https://github.com/settings/tokens>.
if (serverSecrets && serverSecrets.gh_token) {
  addGithubToken(serverSecrets.gh_token);
}

// Act like request(), but tweak headers and query to avoid hitting a rate
// limit.
function githubRequest(request, url, query, cb) {
  query = query || {};
  // A special User-Agent is required:
  // http://developer.github.com/v3/#user-agent-required
  var headers = {
    'User-Agent': 'Shields.io',
    'Accept': 'application/vnd.github.v3+json',
  };
  var githubToken = getReqRemainingToken();

  if (githubToken != null) {
    // Typically, GitHub user tokens grants us 12500 req/hour.
    headers['Authorization'] = 'token ' + githubToken;
  } else if (serverSecrets && serverSecrets.gh_client_id) {
    // Using our OAuth App secret grants us 5000 req/hour
    // instead of the standard 60 req/hour.
    query.client_id = serverSecrets.gh_client_id;
    query.client_secret = serverSecrets.gh_client_secret;
  }

  var qs = querystring.stringify(query);
  if (qs) { url += '?' + qs; }
  request(url, {headers: headers}, function(err, res, buffer) {
    if (githubToken != null) {
      if (res.statusCode === 401) {  // Unauthorized.
        rmGithubToken(githubToken);
      } else {
        var remaining = +res.headers['x-ratelimit-remaining'];
        // reset is in UTC epoch seconds.
        var reset = +res.headers['x-ratelimit-reset'];
        setReqRemaining(githubToken, remaining, reset);
        if (remaining === 0) { return; }  // Hope for the best in the cache.
      }
    }
    cb(err, res, buffer);
  });
}

exports.setRoutes = setRoutes;
exports.request = githubRequest;
