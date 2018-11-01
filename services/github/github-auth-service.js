'use strict'

const BaseJsonService = require('../base-json')

module.exports = class GithubAuthService extends BaseJsonService {
  constructor(context, config) {
    super(context, config)

    const { sendAndCacheRequestWithCallbacks, githubApiProvider } = context

    this._requestFetcher = async (url, query) =>
      githubApiProvider.requestAsPromise(
        sendAndCacheRequestWithCallbacks,
        url,
        query
      )
  }
}
