import { expect } from 'chai'
import sinon from 'sinon'
import GithubApiProvider from './github-api-provider.js'

describe('Github API provider', function () {
  const baseUrl = 'https://github-api.example.com'
  const reserveFraction = 0.333

  const maxTokenFailedAttempts = 3
  const maxSamlRetries = 2

  // A stateful mock so recordFailedAttempt/resetFailedAttempts drive the
  // provider's eviction threshold the same way the real Token would.
  const makeMockToken = id => {
    let failedAttempts = 0
    return {
      id,
      update: sinon.spy(),
      invalidate: sinon.spy(),
      recordFailedAttempt: sinon.spy(() => (failedAttempts += 1)),
      resetFailedAttempts: sinon.spy(() => {
        failedAttempts = 0
      }),
    }
  }

  let mockStandardToken, mockSearchToken, mockGraphqlToken, provider
  beforeEach(function () {
    provider = new GithubApiProvider({
      baseUrl,
      authType: GithubApiProvider.AUTH_TYPES.TOKEN_POOL,
      reserveFraction,
      maxTokenFailedAttempts,
      maxSamlRetries,
    })

    mockStandardToken = makeMockToken('standard-token')
    sinon.stub(provider.standardTokens, 'next').returns(mockStandardToken)

    mockSearchToken = makeMockToken('search-token')
    sinon.stub(provider.searchTokens, 'next').returns(mockSearchToken)

    mockGraphqlToken = makeMockToken('graphql-token')
    sinon.stub(provider.graphqlTokens, 'next').returns(mockGraphqlToken)
  })

  context('a search API request', function () {
    it('should obtain an appropriate token', async function () {
      const mockResponse = { res: { headers: {} } }
      const mockRequest = sinon.stub().resolves(mockResponse)
      await provider.fetch(mockRequest, '/search', {})
      expect(provider.searchTokens.next).to.have.been.calledOnce
      expect(provider.standardTokens.next).not.to.have.been.called
      expect(provider.graphqlTokens.next).not.to.have.been.called
    })
  })

  context('a graphql API request', function () {
    it('should obtain an appropriate token', async function () {
      const mockResponse = { res: { headers: {} } }
      const mockRequest = sinon.stub().resolves(mockResponse)
      await provider.fetch(mockRequest, '/graphql', {})
      expect(provider.searchTokens.next).not.to.have.been.called
      expect(provider.standardTokens.next).not.to.have.been.called
      expect(provider.graphqlTokens.next).to.have.been.calledOnce
    })
  })

  context('a core API request', function () {
    it('should obtain an appropriate token', async function () {
      const mockResponse = { res: { headers: {} } }
      const mockRequest = sinon.stub().resolves(mockResponse)
      await provider.fetch(mockRequest, '/repo', {})
      expect(provider.searchTokens.next).not.to.have.been.called
      expect(provider.standardTokens.next).to.have.been.calledOnce
      expect(provider.graphqlTokens.next).not.to.have.been.called
    })
  })

  context('a valid V3 API response', function () {
    const rateLimit = 12500
    const remaining = 7955
    const nextReset = 123456789
    const mockResponse = {
      res: {
        statusCode: 200,
        headers: {
          'x-ratelimit-limit': rateLimit,
          'x-ratelimit-remaining': remaining,
          'x-ratelimit-reset': nextReset,
        },
        buffer: Buffer.alloc(0),
      },
    }
    const mockRequest = sinon.stub().resolves(mockResponse)

    it('should return the response', async function () {
      const res = await provider.fetch(mockRequest, '/repo', {})
      expect(Object.is(res, mockResponse)).to.be.true
    })

    it('should update the token with the expected values', async function () {
      await provider.fetch(mockRequest, '/foo', {})
      const expectedUsesRemaining =
        remaining - Math.ceil(reserveFraction * rateLimit)
      expect(mockStandardToken.update).to.have.been.calledWith(
        expectedUsesRemaining,
        nextReset,
      )
      expect(mockStandardToken.invalidate).not.to.have.been.called
    })
  })

  context('a valid V4 API response', function () {
    const rateLimit = 12500
    const remaining = 7955
    const nextReset = 123456789
    const mockResponse = {
      res: {
        statusCode: 200,
        headers: {},
        body: `{
        "data": {
          "rateLimit": {
            "limit": 12500,
            "cost": 1,
            "remaining": 7955,
            "resetAt": "1973-11-29T21:33:09Z"
          }
        }
      }`,
      },
    }
    const mockRequest = sinon.stub().resolves(mockResponse)

    it('should return the response', async function () {
      const res = await provider.fetch(mockRequest, '/graphql', {})
      expect(Object.is(res, mockResponse)).to.be.true
    })

    it('should update the token with the expected values', async function () {
      await provider.fetch(mockRequest, '/graphql', {})
      const expectedUsesRemaining =
        remaining - Math.ceil(reserveFraction * rateLimit)
      expect(mockGraphqlToken.update).to.have.been.calledWith(
        expectedUsesRemaining,
        nextReset,
      )
      expect(mockGraphqlToken.invalidate).not.to.have.been.called
    })
  })

  context('unauthorized API responses', function () {
    it('does not evict the token on a single 401, but records the attempt (v3)', async function () {
      const mockResponse = { res: { statusCode: 401, headers: {} } }
      const mockRequest = sinon.stub().resolves(mockResponse)
      await provider.fetch(mockRequest, '/foo', {})
      expect(mockStandardToken.recordFailedAttempt).to.have.been.calledOnce
      expect(mockStandardToken.invalidate).not.to.have.been.called
      expect(mockStandardToken.update).not.to.have.been.called
    })

    it('evicts the token after maxTokenFailedAttempts consecutive 401s (v3)', async function () {
      const mockResponse = { res: { statusCode: 401, headers: {} } }
      const mockRequest = sinon.stub().resolves(mockResponse)
      for (let i = 0; i < maxTokenFailedAttempts; i++) {
        await provider.fetch(mockRequest, '/foo', {})
      }
      expect(mockStandardToken.invalidate).to.have.been.calledOnce
    })

    it('evicts the token after maxTokenFailedAttempts consecutive 401s (v4)', async function () {
      const mockResponse = { res: { statusCode: 401, body: {} } }
      const mockRequest = sinon.stub().resolves(mockResponse)
      for (let i = 0; i < maxTokenFailedAttempts; i++) {
        await provider.fetch(mockRequest, '/graphql', {})
      }
      expect(mockGraphqlToken.invalidate).to.have.been.calledOnce
      expect(mockGraphqlToken.update).not.to.have.been.called
    })

    it('resets the failed-attempt counter on a successful response (v3)', async function () {
      const failResponse = { res: { statusCode: 401, headers: {} } }
      const okResponse = {
        res: {
          statusCode: 200,
          headers: {
            'x-ratelimit-limit': 5000,
            'x-ratelimit-remaining': 4000,
            'x-ratelimit-reset': 123456789,
          },
        },
      }
      await provider.fetch(sinon.stub().resolves(failResponse), '/foo', {})
      await provider.fetch(sinon.stub().resolves(okResponse), '/foo', {})
      expect(mockStandardToken.resetFailedAttempts).to.have.been.calledOnce
    })

    it('invalidates immediately when the account is suspended (v4)', async function () {
      const mockResponse = {
        res: {
          statusCode: 200,
          body: '{ "message": "Sorry. Your account was suspended." }',
        },
      }
      const mockRequest = sinon.stub().resolves(mockResponse)
      await provider.fetch(mockRequest, '/graphql', {})
      expect(mockGraphqlToken.invalidate).to.have.been.calledOnce
      expect(mockGraphqlToken.update).not.to.have.been.called
    })
  })

  context('SAML enforcement', function () {
    const samlMessage =
      'Resource protected by organization SAML enforcement. You must grant your OAuth token access to this organization.'
    const v3Headers = {
      'x-ratelimit-limit': 5000,
      'x-ratelimit-remaining': 4000,
      'x-ratelimit-reset': 123456789,
    }
    const v4Body = ({ errors } = {}) =>
      JSON.stringify({
        data: {
          repository: errors ? null : { forkCount: 42 },
          rateLimit: {
            limit: 5000,
            cost: 1,
            remaining: 4000,
            resetAt: '1973-11-29T21:33:09Z',
          },
        },
        errors,
      })
    const samlV3Response = {
      res: {
        statusCode: 403,
        headers: {
          ...v3Headers,
          'x-github-sso':
            'required; url=https://github.com/orgs/example/sso?authorization_request=abc',
        },
        body: JSON.stringify({ message: samlMessage }),
      },
    }
    const okV3Response = { res: { statusCode: 200, headers: v3Headers } }
    const samlV4Response = {
      res: {
        statusCode: 200,
        headers: {},
        body: v4Body({
          errors: [
            {
              type: 'FORBIDDEN',
              path: ['repository'],
              extensions: { saml_failure: true },
              message: samlMessage,
            },
          ],
        }),
      },
    }
    const okV4Response = {
      res: { statusCode: 200, headers: {}, body: v4Body() },
    }

    let otherStandardToken, otherGraphqlToken
    beforeEach(function () {
      otherStandardToken = makeMockToken('other-standard-token')
      provider.standardTokens.next.onSecondCall().returns(otherStandardToken)
      sinon.spy(provider.standardTokens, 'endBatchFor')

      otherGraphqlToken = makeMockToken('other-graphql-token')
      provider.graphqlTokens.next.onSecondCall().returns(otherGraphqlToken)
      sinon.spy(provider.graphqlTokens, 'endBatchFor')
    })

    it('retries a GraphQL request with another token (v4)', async function () {
      const mockRequest = sinon.stub()
      mockRequest.onFirstCall().resolves(samlV4Response)
      mockRequest.onSecondCall().resolves(okV4Response)

      const res = await provider.fetch(mockRequest, '/graphql', {})

      expect(Object.is(res, okV4Response)).to.be.true
      expect(mockRequest).to.have.been.calledTwice
      expect(mockRequest.firstCall.args[1].headers.Authorization).to.equal(
        'token graphql-token',
      )
      expect(mockRequest.secondCall.args[1].headers.Authorization).to.equal(
        'token other-graphql-token',
      )
      expect(provider.graphqlTokens.endBatchFor).to.have.been.calledOnceWith(
        mockGraphqlToken,
      )
      expect(mockGraphqlToken.invalidate).not.to.have.been.called
      expect(mockGraphqlToken.update).to.have.been.calledOnce
    })

    it('retries a REST request with another token (v3)', async function () {
      const mockRequest = sinon.stub()
      mockRequest.onFirstCall().resolves(samlV3Response)
      mockRequest.onSecondCall().resolves(okV3Response)

      const res = await provider.fetch(mockRequest, '/repos/example/repo', {})

      expect(Object.is(res, okV3Response)).to.be.true
      expect(mockRequest).to.have.been.calledTwice
      expect(mockRequest.secondCall.args[1].headers.Authorization).to.equal(
        'token other-standard-token',
      )
      expect(provider.standardTokens.endBatchFor).to.have.been.calledOnceWith(
        mockStandardToken,
      )
      expect(mockStandardToken.invalidate).not.to.have.been.called
    })

    it('returns the last response after maxSamlRetries retries', async function () {
      const mockRequest = sinon.stub().resolves(samlV4Response)

      const res = await provider.fetch(mockRequest, '/graphql', {})

      expect(Object.is(res, samlV4Response)).to.be.true
      expect(mockRequest).to.have.callCount(maxSamlRetries + 1)
      expect(provider.graphqlTokens.endBatchFor).to.have.callCount(
        maxSamlRetries,
      )
    })

    it('does not retry other GraphQL errors (v4)', async function () {
      const forbiddenResponse = {
        res: {
          statusCode: 200,
          headers: {},
          body: v4Body({
            errors: [
              {
                type: 'FORBIDDEN',
                path: ['repository'],
                extensions: { saml_failure: false },
                message: 'Resource not accessible by personal access token',
              },
            ],
          }),
        },
      }
      const mockRequest = sinon.stub().resolves(forbiddenResponse)

      const res = await provider.fetch(mockRequest, '/graphql', {})

      expect(Object.is(res, forbiddenResponse)).to.be.true
      expect(mockRequest).to.have.been.calledOnce
      expect(provider.graphqlTokens.endBatchFor).not.to.have.been.called
    })

    it('does not retry a 403 without an X-GitHub-SSO header (v3)', async function () {
      const forbiddenResponse = { res: { statusCode: 403, headers: v3Headers } }
      const mockRequest = sinon.stub().resolves(forbiddenResponse)

      const res = await provider.fetch(mockRequest, '/repos/example/repo', {})

      expect(Object.is(res, forbiddenResponse)).to.be.true
      expect(mockRequest).to.have.been.calledOnce
      expect(provider.standardTokens.endBatchFor).not.to.have.been.called
    })

    it('does not retry when using a global token', async function () {
      const globalTokenProvider = new GithubApiProvider({
        baseUrl,
        authType: GithubApiProvider.AUTH_TYPES.GLOBAL_TOKEN,
        globalToken: 'global-token',
      })
      const mockRequest = sinon.stub().resolves(samlV4Response)

      const res = await globalTokenProvider.fetch(mockRequest, '/graphql', {})

      expect(Object.is(res, samlV4Response)).to.be.true
      expect(mockRequest).to.have.been.calledOnce
    })
  })

  context('a connection error', function () {
    it('should throw an exception', function () {
      const msg = 'connection timeout'
      const requestError = new Error(msg)
      const mockRequest = sinon.stub().rejects(requestError)
      return expect(provider.fetch(mockRequest, '/foo', {})).to.be.rejectedWith(
        Error,
        'connection timeout',
      )
    })
  })
})
