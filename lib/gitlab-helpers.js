'use strict';

const queryString = require('query-string');
const { URL } = require('url');
const { Token, TokenPool } = require('./token-pool.js');

const RATE_LIMIT = 600;

const BUILD_COLORS = {
  unknown: 'lightgray',
  passed: 'brightgreen',
  running:  'blue',
  canceled: 'orange',
  failed: 'red',
};

const tokenPool = new TokenPool(RATE_LIMIT);
let unauthorizedPool;

function getUnauthorized() {
  if (unauthorizedPool === undefined) {
    unauthorizedPool = new TokenPool(RATE_LIMIT);
    unauthorizedPool.add(null, null, RATE_LIMIT, Token.nextResetNever);
  }

  return unauthorizedPool.next();
}

function addToken(token) {
  tokenPool.add(token, null, RATE_LIMIT, Token.nextResetNever);
}

function getToken(optional = true) {
  if (optional) {
    return (getUnauthorized() || tokenPool.next());
  } else {
    return tokenPool.next();
  }
}

function request(request, url, query, optionalAuth, callback) {
  const qs = queryString.stringify(query || {});
  const parsedURL = new URL(url);

  if (parsedURL.hostname !== "gitlab.com") {
    return;
  }

  const token = getToken(optionalAuth);
  const customHeaders = {};

  if (!optionalAuth && (token === null)) {
    return;
  }

  if (token !== null && token.id !== null) {
    customHeaders['Authorization'] = 'Bearer ' + token.id;
  }

  if (qs) {
    url += '?' + qs;
  }

  request(url, {headers: customHeaders}, function(err, res, buf) {
    if (token !== null && err === null) {
      if (res.statusCode === 401 && token.id !== null) {
        token.invalidate();
      } else {
        const remainingUses = parseInt(res.headers['ratelimit-remaining']);
        const reset = parseInt(res.headers['ratelimit-reset']);
        token.update(remainingUses, reset);
      }
    }
    callback(err, res, buf);
  });
}

function baseURL(match) {
  const scheme = match[2] || 'https';
  const host = match[3] || 'gitlab.com';
  return (scheme + '://' + host);
}

function buildColor(buildStatus) {
  return (BUILD_COLORS[buildStatus] || 'lightgray');
}

function issueColor(issueCount, openIssues = true) {
  if (openIssues) {
    return (issueCount > 0 ? 'red' : 'brightgreen');
  } else {
    return (issueCount > 0 ? 'brightgreen' : 'red');
  }
}

function topLanguage(languages) {
  let topLang;
  let maxRatio = 0;

  Object.entries(languages).map(function(pair) {
    if (pair[1] > maxRatio) {
      topLang = pair[0];
      maxRatio = pair[1];
    }
  });

  return [topLang, maxRatio];
}

module.exports = {
  addToken,
  baseURL,
  request,
  buildColor,
  issueColor,
  topLanguage,
};
