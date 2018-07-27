'use strict';

class GithubApiProvider {
  constructor(baseUrl, tokenProvider) {
    this.baseUrl = baseUrl;
    this.tokenProvider = tokenProvider;

    // How much of a token's quota do we reserve for the user?
    this.reserveFraction = 0.25;
  }

  updateToken(token, headers) {
    const rateLimit = +headers['x-ratelimit-limit'];
    const reserve = this.reserveFraction * rateLimit;
    const usesRemaining = +headers['x-ratelimit-remaining'] - reserve;

    const nextReset = +headers['x-ratelimit-reset'];

    token.update(usesRemaining, nextReset);
  }

  tokenForUri(url) {
    if (url.startsWith('/search')) {
      return this.tokenProvider.nextSearchToken();
    } else {
      return this.tokenProvider.nextToken();
    }
  }

  // Act like request(), but tweak headers and query to avoid hitting a rate
  // limit. Inject `request` so we can pass in `cachingRequest` from
  // `request-handler.js`.
  request(request, url, query, callback) {
    const { baseUrl } = this;

    let token;
    try {
      token = this.tokenForUri(url);
    } catch (e) {
      callback(e);
      return;
    }

    const options = {
      url,
      baseUrl,
      qs: query,
      headers: {
        'User-Agent': 'Shields.io',
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${token.id}`,
      },
    };

    request(options, (err, res, buffer) => {
      if (err === null) {
        if (res.statusCode === 401) {
          token.invalidate();
        } else if (res.statusCode < 500) {
          this.updateToken(token, res.headers);
        }
      }
      callback(err, res, buffer);
    });
  }

  requestAsPromise(request, url, query) {
    return new Promise((resolve, reject) => {
      this.request(request, url, query, (err, res, buffer) => {
        if (err) {
          reject(err);
        } else {
          resolve({ res, buffer });
        }
      });
    });
  }
}

module.exports = GithubApiProvider;
