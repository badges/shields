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
    const remaining = headers.map(h => +h['x-ratelimit-remaining'])
    const expected = Array.from({ length: 10 }, (e, i) => remaining[0] - i)
    expect(remaining).to.deep.equal(expected)
  })
})
