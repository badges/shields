var nodeUrl = require('url');
var request = require('request');
var Promise = require('promise');
var serverSecrets;
try {
  // Everything that cannot be checked in but is useful server-side
  // is stored in this JSON data.
  serverSecrets = require('./secret.json');
} catch(e) { console.error('No secret data (secret.json, see server.js):', e); }

// data: {url}, JSON-serializable object.
// end: function(json), with json of the form:
//  - badges: list of objects of the form:
//    - link: target as a string URL.
//    - badge: shields image URL.
//    - name: string
var suggest = function(data, end, ask) {
  ask.res.setHeader('Access-Control-Allow-Origin', 'http://shields.io');
  try {
    var url = nodeUrl.parse(data.url);
  } catch(e) { end({err:''+e}); return; }
  findSuggestions(url, end);
};

// url: string
// cb: function({badges})
var findSuggestions = function(url, cb) {
  var userRepo = url.pathname.slice(1).split('/');
  var user = userRepo[0];
  var repo = userRepo[1];
  var promises = [];
  if (url.hostname === 'github.com') {
    promises = promises.concat([
      githubIssues(user, repo),
      githubForks(user, repo),
      githubStars(user, repo),
      githubLicense(user, repo),
    ]);
  }
  promises.push(twitterPage(url));
  Promise.all(promises).then(function(badges) {
    cb({badges:badges.filter(function(b) { return b != null; })});
  }).catch(function(err) {
    cb({badges:[], err:err});
  });
};

var twitterPage = function(url) {
  var schema = url.protocol.slice(0, -1);
  var host = url.host;
  var path = url.path;
  return Promise.resolve({
    name: 'Twitter',
    link: 'https://twitter.com/intent/tweet?text=Wow:&url=' + encodeURIComponent(url),
    badge: 'https://img.shields.io/twitter/url/' + schema + '/' + host + path + '.svg?style=social',
  });
};
var githubIssues = function(user, repo) {
  var userRepo = user + '/' + repo;
  return Promise.resolve({
    name: 'GitHub issues',
    link: 'https://github.com/' + userRepo + '/issues',
    badge: 'https://img.shields.io/github/issues/' + userRepo + '.svg',
  });
};
var githubForks = function(user, repo) {
  var userRepo = user + '/' + repo;
  return Promise.resolve({
    name: 'GitHub forks',
    link: 'https://github.com/' + userRepo + '/network',
    badge: 'https://img.shields.io/github/forks/' + userRepo + '.svg',
  });
};
var githubStars = function(user, repo) {
  var userRepo = user + '/' + repo;
  return Promise.resolve({
    name: 'GitHub stars',
    link: 'https://github.com/' + userRepo + '/stargazers',
    badge: 'https://img.shields.io/github/stars/' + userRepo + '.svg',
  });
};

// user: eg, qubyte
// repo: eg, rubidium
// returns a promise of {link, badge, name}
var githubLicense = function(user, repo) {
  return new Promise(function(resolve, reject) {
    // Step 1: Get the repo's default branch.
    var apiUrl = 'https://api.github.com/repos/' + user + '/' + repo + '';
    // Using our OAuth App secret grants us 5000 req/hour
    // instead of the standard 60 req/hour.
    if (serverSecrets) {
      apiUrl += '?client_id=' + serverSecrets.gh_client_id
        + '&client_secret=' + serverSecrets.gh_client_secret;
    }
    var badgeData = {text:['license',''], colorscheme:'blue'};
    // A special User-Agent is required:
    // http://developer.github.com/v3/#user-agent-required
    request(apiUrl, { headers: { 'User-Agent': 'Shields.io' } }, function(err, res, buffer) {
      if (err != null) { resolve(null); return; }
      try {
        if ((+res.headers['x-ratelimit-remaining']) === 0) { resolve(null); return; }
        var data = JSON.parse(buffer);
        var defaultBranch = data.default_branch;
        // Step 2: Get the SHA-1 hash of the branch tip.
        var apiUrl = 'https://api.github.com/repos/' + user + '/' + repo + '/branches/' + defaultBranch;
        if (serverSecrets) {
          apiUrl += '?client_id=' + serverSecrets.gh_client_id
            + '&client_secret=' + serverSecrets.gh_client_secret;
        }
        request(apiUrl, { headers: { 'User-Agent': 'Shields.io' } }, function(err, res, buffer) {
          if (err != null) { resolve(null); return; }
          try {
            if ((+res.headers['x-ratelimit-remaining']) === 0) { resolve(null); return; }
            var data = JSON.parse(buffer);
            var branchTip = data.commit.sha;
            // Step 3: Get the tree at the commit.
            var apiUrl = 'https://api.github.com/repos/' + user + '/' + repo + '/git/trees/' + branchTip;
            if (serverSecrets) {
              apiUrl += '?client_id=' + serverSecrets.gh_client_id
                + '&client_secret=' + serverSecrets.gh_client_secret;
            }
            request(apiUrl, { headers: { 'User-Agent': 'Shields.io' } }, function(err, res, buffer) {
              if (err != null) { resolve(null); return; }
              try {
                if ((+res.headers['x-ratelimit-remaining']) === 0) { resolve(null); return; }
                var data = JSON.parse(buffer);
                var treeArray = data.tree;
                var licenseBlob;
                var licenseFilename;
                // Crawl each file in the root directory
                for (var i = 0; i < treeArray.length; i++) {
                  if (treeArray[i].type != 'blob') {
                    continue;
                  }
                  if (treeArray[i].path.match(/(LICENSE|COPYING|COPYRIGHT).*/i)) {
                    licenseBlob = treeArray[i].sha;
                    licenseFilename = treeArray[i].path;
                    break;
                  }
                }
                // Could not find license file
                if (!licenseBlob) { resolve(null); return; }

                // Step 4: Get the license blob.
                var apiUrl = 'https://api.github.com/repos/' + user + '/' + repo + '/git/blobs/' + licenseBlob;
                var link = 'https://raw.githubusercontent.com/' +
                  [user, repo, defaultBranch, licenseFilename].join('/');

                if (serverSecrets) {
                  apiUrl += '?client_id=' + serverSecrets.gh_client_id
                    + '&client_secret=' + serverSecrets.gh_client_secret;
                }
                // Get the raw blob instead of JSON
                // https://developer.github.com/v3/media/
                request(apiUrl, { headers: { 'User-Agent': 'Shields.io', 'Accept': 'appplication/vnd.github.raw' } },
                function(err, res, buffer) {
                  if (err != null) { resolve(null); return; }
                  try {
                    if ((+res.headers['x-ratelimit-remaining']) === 0) { resolve(null); return; }
                    var license = guessLicense(buffer);
                    if (license) {
                      badgeData.text[1] = license;
                      resolve({
                        link: link,
                        badge: shieldsBadge(badgeData),
                        name: 'GitHub license'
                      });
                      return;
                    } else {
                      // Not a recognized license
                      resolve(null);
                      return;
                    }
                  } catch(e) { reject(e); return; }
                });
              } catch(e) { reject(e); return; }
            });
          } catch(e) { reject(e); return; }
        });
      } catch(e) { reject(e); return; }
    });
  });
};

// Key phrases for common licenses
var licensePhrases = {
  'Apache 1.1': 'apache (software )?license,? (version)? 1\\.1',
  'Apache 2': 'apache (software )?license,? (version)? 2',
  'Original BSD': 'all advertising materials mentioning features or use of this software must display the following acknowledgement',
  'New BSD': 'may be used to endorse or promote products derived from this software without specific prior written permission',
  'BSD': 'redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met',
  'GPLv2': 'gnu general public license,? version 2',
  'GPLv3': 'gnu general public license,? version 3',
  'GPL': 'gnu general public license',
  'LGPLv2.0': 'gnu library general public license,? version 2',
  'LGPLv2.1': 'gnu lesser general public license,? version 2\\.1',
  'LGPLv3': 'gnu lesser general public license,? version 3',
  'LGPL': 'gnu (library|lesser) general public license',
  'MIT': '\\(?(mit|expat|x11)\\)? license|permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files',
  'MPL 1.1': 'mozilla public license,? (\\(MPL\\) )?(version |v|v\\.)?1\\.1',
  'MPL 2': 'mozilla public license,? (\\(MPL\\) )?(version |v|v\\.)?2',
  'MPL': 'mozilla public license',
  'CDDL': 'common development and distribution license',
  'Eclipse': 'eclipse public license',
  'Artistic': 'artistic license',
  'zlib': 'the origin of this software must not be misrepresented',
  'AGPLv1': 'affero general public license,? version 1',
  'AGPLv3': 'affero general public license,? version 3',
  'AGPL': 'affero general public license',
  'ISC': 'permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted',
  'CC0': 'cc0',
  'Unlicense': 'this is free and unencumbered software released into the public domain',
}
var licenseCodes = Object.keys(licensePhrases);
var spaceMetaRegex = new RegExp(' ', 'g');

// Spaces can be any whitespace
for (var i = 0; i < licenseCodes.length; i++) {
  licensePhrases[licenseCodes[i]] = licensePhrases[licenseCodes[i]].replace(spaceMetaRegex, '\\s+');
}

// Try to guess the license based on the text and return an abbreviated name (or null if not recognized).
var guessLicense = function(text) {
  var licenseRegex;
  for (var i = 0; i < licenseCodes.length; i++) {
    licenseRegex = licensePhrases[licenseCodes[i]];
    if (text.match(new RegExp(licenseRegex, 'i'))) {
      return licenseCodes[i];
    }
  }
  // Not a recognized license
  return null;
};


var shieldsBadge = function(badgeData) {
  return ('https://img.shields.io/badge/'
    + escapeField(badgeData.text[0])
    + '-' + escapeField(badgeData.text[1])
    + '-' + badgeData.colorscheme + '.svg');
};

var escapeField = function(s) {
  return encodeURIComponent(s.replace(/-/g, '--').replace(/_/g, '__'));
};

module.exports = suggest;
