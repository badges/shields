'use strict'

const BaseJsonService = require('../base-json')
const { staticAuthConfigured } = require('./github-helpers')

function createRequestFetcher(context, config) {
  const { sendAndCacheRequestWithCallbacks, githubApiProvider } = context

  return async (url, { qs }) =>
    githubApiProvider.requestAsPromise(
      sendAndCacheRequestWithCallbacks,
      url,
      qs
    )
}

class GithubAuthService extends BaseJsonService {
  constructor(context, config) {
    super(context, config)
    this._requestFetcher = createRequestFetcher(context, config)
    this.staticAuthConfigured = true
  }
}

// Use Github auth, but only when static auth is configured. By using this
// class, in production it will behave like GithubAuthService, and in self-
// hosting (i.e. with a configured token) like BaseJsonService. This avoids
// wasting API quota on public files in production.
class ConditionalGithubAuthService extends BaseJsonService {
  constructor(context, config) {
    super(context, config)
    if (staticAuthConfigured()) {
      this._requestFetcher = createRequestFetcher(context, config)
      this.staticAuthConfigured = true
    } else {
      this.staticAuthConfigured = false
    }
  }
}

module.exports = {
  GithubAuthService,
  ConditionalGithubAuthService,
}
