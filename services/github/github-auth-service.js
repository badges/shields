'use strict'

const BaseJsonService = require('../base-json')

module.exports = class GithubAuthService extends BaseJsonService {
  constructor(context, config) {
    super(context, config)

    const { sendAndCacheRequestWithCallbacks, githubApiProvider } = context

    this._requestFetcher = async (url, { qs }) =>
      githubApiProvider.requestAsPromise(
        sendAndCacheRequestWithCallbacks,
        url,
        qs
      )
  }
}
