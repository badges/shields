'use strict';

const nodeUrl = require('url');
const request = require('request');
const githubAuth = require('./github-auth');

const githubApiUrl = process.env.GITHUB_URL || 'https://api.github.com';

// data: {url}, JSON-serializable object.
// end: function(json), with json of the form:
//  - badges: list of objects of the form:
//    - link: target as a string URL.
//    - badge: shields image URL.
//    - name: string
function suggest (allowedOrigin, data, end, ask) {
  // Same-host requests may be made in development or in single-server
  // testing. These are legitimate, but do not have an origin header.
  const origin = ask.req.headers.origin;
  if (origin) {
    if (allowedOrigin.includes(origin)) {
      ask.res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      ask.res.setHeader('Access-Control-Allow-Origin', 'null');
      end({err: 'Disallowed'});
      return;
    }
  }

  let url;
  try {
    url = nodeUrl.parse(data.url);
  } catch(e) { end({err: ''+e}); return; }
  findSuggestions(url, end);
}

// url: string
// cb: function({badges})
function findSuggestions (url, cb) {
  const userRepo = url.pathname.slice(1).split('/');
  const user = userRepo[0];
  const repo = userRepo[1];
  let promises = [];
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
    // eslint-disable-next-line standard/no-callback-literal
    cb({badges: badges.filter(function(b) { return b != null; })});
  }).catch(function(err) {
    // eslint-disable-next-line standard/no-callback-literal
    cb({badges: [], err: err});
  });
}

function twitterPage (url) {
  const schema = url.protocol.slice(0, -1);
  const host = url.host;
  const path = url.path;
  return Promise.resolve({
    name: 'Twitter',
    link: 'https://twitter.com/intent/tweet?text=Wow:&url=' + encodeURIComponent(url.href),
    badge: 'https://img.shields.io/twitter/url/' + schema + '/' + host + path + '.svg?style=social',
  });
}

function githubIssues (user, repo) {
  const userRepo = user + '/' + repo;
  return Promise.resolve({
    name: 'GitHub issues',
    link: 'https://github.com/' + userRepo + '/issues',
    badge: 'https://img.shields.io/github/issues/' + userRepo + '.svg',
  });
}

function githubForks (user, repo) {
  const userRepo = user + '/' + repo;
  return Promise.resolve({
    name: 'GitHub forks',
    link: 'https://github.com/' + userRepo + '/network',
    badge: 'https://img.shields.io/github/forks/' + userRepo + '.svg',
  });
}

function githubStars (user, repo) {
  const userRepo = user + '/' + repo;
  return Promise.resolve({
    name: 'GitHub stars',
    link: 'https://github.com/' + userRepo + '/stargazers',
    badge: 'https://img.shields.io/github/stars/' + userRepo + '.svg',
  });
}

function githubLicense (user, repo) {
  return new Promise((resolve) => {
    const apiUrl = `${githubApiUrl}/repos/${user}/${repo}/license`;
    githubAuth.request(request, apiUrl, {}, function(err, res, buffer) {
      if (err !== null) {
        resolve(null);
        return;
      }
      const defaultBadge = {
        name: 'GitHub license',
        link: `https://github.com/${user}/${repo}`,
        badge: `https://img.shields.io/github/license/${user}/${repo}.svg`
      };
      if (res.statusCode !== 200) {
        resolve(defaultBadge);
      }
      try {
        const data = JSON.parse(buffer);
        if (data.html_url) {
          defaultBadge.link = data.html_url;
          resolve(defaultBadge);
        } else {
          resolve(defaultBadge);
        }
      } catch(e) {
        resolve(defaultBadge);
      }
    })
  });
}

function setRoutes (allowedOrigin, camp) {
  camp.ajax.on(
    'suggest/v1',
    (data, end, ask) => suggest(allowedOrigin, data, end, ask));
}

module.exports = {
  suggest,
  setRoutes,
};
