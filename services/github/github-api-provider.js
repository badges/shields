'use strict'

const githubAuth = require('../../lib/github-auth')

// Provide an interface to the Github API. Manages the base URL.
//
// Eventually this class will be responsible for managing headers,
// authentication, and actually making the request. Currently it's delegating
// to legacy code.
class GithubApiProvider {
  constructor({ baseUrl }) {
    this.baseUrl = baseUrl
  }

  // Act like request(), but tweak headers and query to avoid hitting a rate
  // limit. Inject `request` so we can pass in `cachingRequest` from
  // `request-handler.js`.
  request(request, url, query, callback) {
    const { baseUrl } = this

    githubAuth.request(
      request,
      `${baseUrl}${url}`,
      query,
      (err, res, buffer) => {
        callback(err, res, buffer)
      }
    )
  }

  requestAsPromise(request, url, query) {
    return new Promise((resolve, reject) => {
      this.request(request, url, query, (err, res, buffer) => {
        if (err) {
          reject(err)
        } else {
          resolve({ res, buffer })
        }
      })
    })
  }
}

module.exports = GithubApiProvider
