'use strict';

class GithubProvider {
  constructor (baseUri, tokenProvider) {
    this.baseUri = baseUri;
    this.tokenProvider = tokenProvider;
    this.reserve = tokenProvider.reserve;
  }

  updateToken (token, headers) {
    const rateLimit = +headers['x-ratelimit-limit'];
    const reserve = this.reserve * rateLimit;
    const usesRemaining = +headers['x-ratelimit-remaining'] - reserve;

    const nextReset = +headers['x-ratelimit-reset'];

    token.update(usesRemaining, nextReset);
  }

  // Act like request(), but tweak headers and query to avoid hitting a rate
  // limit. Inject `request` so we can pass in `cachingRequest` from
  // `request-handler.js`.
  request (request, url, query, callback) {
    const isSearch = url.startsWith('/search');

    let token;
    try {
      if (isSearch) {
        token = this.tokenProvider.nextSearchToken();
      } else {
        token = this.tokenProvider.nextToken();
      }
    } catch (e) {
      callback(e);
      return;
    }

    const options = {
      url,
      baseUrl: this.baseUri,
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
}

module.exports = GithubProvider;
