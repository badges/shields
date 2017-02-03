var querystring = require('querystring');
var request = require('request');
var autosave = require('json-autosave');
var serverSecrets;
try {
  // Everything that cannot be checked in but is useful server-side
  // is stored in this JSON data.
  serverSecrets = require('../secret.json');
} catch(e) {}
var gitlabUserTokens;
var gitlabUserTokensFile = '.gitlab-user-tokens.json';
autosave(gitlabUserTokensFile, {data:[]}).then(function(f) {
  gitlabUserTokens = f;
  for (var i = 0; i < gitlabUserTokens.data.length; i++) {
    addGitlabToken(gitlabUserTokens.data[i]);
  }
}).catch(function(e) { console.error('Could not create ' + gitlabUserTokensFile); });

// Retrieve a user token if there is one for which we believe there are requests
// remaining. Return undefined if we could not find one.
function getReqRemainingToken() {
  return gitlabUserTokens.data[0];
}

function addGitlabToken(token) {
  // Insert it only if it is not registered yet.
  if (gitlabUserTokens.data.indexOf(token) === -1) {
    gitlabUserTokens.data.push(token);
  }
}

function rmGitlabToken(token) {
  // Remove it only if it is in there.
  var idx = gitlabUserTokens.data.indexOf(token);
  if (idx >= 0) {
    gitlabUserTokens.data.splice(idx, 1);
  }
}

// Personal tokens allow access to GitLab private repositories.
// You can manage your personal GitLab token at
// <https://gitlab.com/profile/personal_access_tokens>.
if (serverSecrets && serverSecrets.gl_token) {
  addGitlabToken(serverSecrets.gl_token);
}

// Act like request(), but tweak headers and query to avoid hitting a rate
// limit.
function gitlabRequest(request, url, query, cb) {
  query = query || {};
  var headers = {
    'User-Agent': 'Shields.io',
    'Accept': 'application/json',
  };
  var gitlabToken = getReqRemainingToken();

  if (gitlabToken != null) {
    // There's currently no rate limit on API as of 2016.
    headers['PRIVATE-TOKEN'] = gitlabToken;
  }
  // Else, try without authentication (not implemented as of 2016)

  var qs = querystring.stringify(query);
  if (qs) { url += '?' + qs; }
  request(url, {headers: headers}, function(err, res, buffer) {
    if (gitlabToken != null) {
      if (res.statusCode === 401) {  // Unauthorized.
        rmGitlabToken(gitlabToken);
      } else {
        // This was originally for checking rate limits
      }
    }
    cb(err, res, buffer);
  });
}

exports.request = gitlabRequest;