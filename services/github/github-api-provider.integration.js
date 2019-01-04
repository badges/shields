'use strict'

const { expect } = require('chai')
const serverSecrets = require('../../lib/server-secrets')
const GithubApiProvider = require('./github-api-provider')

describe('Github provider with token pool', function() {
  const baseUrl = process.env.GITHUB_URL || 'https://api.github.com'
  const reserveFraction = 0.333

  let githubApiProvider
  before(function() {
    githubApiProvider = new GithubApiProvider({
      baseUrl,
      withPooling: true,
      reserveFraction,
    })

    const { gh_token: token } = serverSecrets
    if (!token) {
      throw Error('The integration tests require a gh_token to be set')
    }

    githubApiProvider.addToken(token)
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

  it('should update the token with the final limit remaining and reset time', function() {
    const lastHeaders = headers.slice(-1)[0]
    const reserve = reserveFraction * +lastHeaders['x-ratelimit-limit']
    const usesRemaining = +lastHeaders['x-ratelimit-remaining'] - reserve
    const nextReset = +lastHeaders['x-ratelimit-reset']

    const tokens = []
    githubApiProvider.standardTokens.forEach(t => {
      tokens.push(t)
    })

    // Confidence check.
    expect(tokens).to.have.lengthOf(1)

    const [token] = tokens
    expect(token.usesRemaining).to.equal(usesRemaining)
    expect(token.nextReset).to.equal(nextReset)
  })
})
