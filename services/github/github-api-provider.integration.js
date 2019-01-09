'use strict'

const { expect } = require('chai')
const GithubApiProvider = require('./github-api-provider')

describe('Github API provider', function() {
  const baseUrl = process.env.GITHUB_URL || 'https://api.github.com'

  let githubApiProvider
  before(function() {
    githubApiProvider = new GithubApiProvider({ baseUrl })
  })

  const headers = []
  async function performOneRequest() {
    const { res } = await githubApiProvider.requestAsPromise(
      require('request'),
      '/repos/rust-lang/rust',
      {}
    )
    expect(res.statusCode).to.equal(200)
    headers.push(res.headers)
  }

  before('should be able to run 10 requests', async function() {
    this.timeout('20s')
    for (let i = 0; i < 10; ++i) {
      await performOneRequest()
    }
  })

  it('should decrement the limit remaining with each request', function() {
    for (let i = 1; i < headers.length; ++i) {
      const current = headers[i]
      const previous = headers[i - 1]
      expect(+current['x-ratelimit-remaining']).to.be.lessThan(
        +previous['x-ratelimit-remaining']
      )
    }
  })
})
