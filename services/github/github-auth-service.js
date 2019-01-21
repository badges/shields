'use strict'

const { BaseJsonService } = require('..')
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
// hosting (i.e. with a configured token) like BaseJsonService. This is
// useful when consuming GitHub endpoints which are not rate-limited: it
// avoids wasting API quota on them in production.
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
