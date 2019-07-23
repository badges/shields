'use strict'

const { mergeQueries } = require('../../core/base-service/graphql')
const { staticAuthConfigured } = require('./github-helpers')
const { BaseJsonService } = require('..')
const { BaseGraphqlService } = require('..')

function createRequestFetcher(context, config) {
  const { sendAndCacheRequestWithCallbacks, githubApiProvider } = context

  return async (url, options) =>
    githubApiProvider.requestAsPromise(
      sendAndCacheRequestWithCallbacks,
      url,
      options
    )
}

class GithubAuthV3Service extends BaseJsonService {
  constructor(context, config) {
    super(context, config)
    this._requestFetcher = createRequestFetcher(context, config)
    this.staticAuthConfigured = true
  }
}

// Use Github auth, but only when static auth is configured. By using this
// class, in production it will behave like GithubAuthV3Service, and in self-
// hosting (i.e. with a configured token) like BaseJsonService. This is
// useful when consuming GitHub endpoints which are not rate-limited: it
// avoids wasting API quota on them in production.
class ConditionalGithubAuthV3Service extends BaseJsonService {
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

class GithubAuthV4Service extends BaseGraphqlService {
  constructor(context, config) {
    super(context, config)
    this._requestFetcher = createRequestFetcher(context, config)
    this.staticAuthConfigured = true
  }

  async _requestGraphql(attrs) {
    attrs.url = `/graphql`

    /*
    The Github v4 API requires us to query the rateLimit object to return
    rate limit info in the query body instead of the headers:
    https://developer.github.com/v4/guides/resource-limitations/#returning-a-calls-rate-limit-status
    This appends the relevant rateLimit query clause to each
    call to the GH v4 API so we can keep track of token usage.
    */
    attrs.query = mergeQueries(
      attrs.query,
      'query { rateLimit { limit cost remaining resetAt } }'
    )

    return super._requestGraphql(attrs)
  }
}

module.exports = {
  GithubAuthV3Service,
  ConditionalGithubAuthV3Service,
  GithubAuthV4Service,
}
