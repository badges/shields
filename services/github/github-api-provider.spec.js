import { expect } from 'chai'
import sinon from 'sinon'
import GithubApiProvider from './github-api-provider.js'

describe('Github API provider', function () {
  const baseUrl = 'https://github-api.example.com'
  const reserveFraction = 0.333

  let mockStandardToken, mockSearchToken, mockGraphqlToken, provider
  beforeEach(function () {
    provider = new GithubApiProvider({ baseUrl, reserveFraction })

    mockStandardToken = { update: sinon.spy(), invalidate: sinon.spy() }
    sinon.stub(provider.standardTokens, 'next').returns(mockStandardToken)

    mockSearchToken = { update: sinon.spy(), invalidate: sinon.spy() }
    sinon.stub(provider.searchTokens, 'next').returns(mockSearchToken)

    mockGraphqlToken = { update: sinon.spy(), invalidate: sinon.spy() }
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
        nextReset
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
        nextReset
      )
      expect(mockGraphqlToken.invalidate).not.to.have.been.called
    })
  })

  context('an unauthorized response', function () {
    it('should invoke the callback and update the token with the expected values', async function () {
      const mockResponse = { res: { statusCode: 401, headers: {} } }
      const mockRequest = sinon.stub().resolves(mockResponse)
      await provider.fetch(mockRequest, '/foo', {})
      expect(mockStandardToken.invalidate).to.have.been.calledOnce
      expect(mockStandardToken.update).not.to.have.been.called
    })
  })

  context('a connection error', function () {
    it('should throw an exception', function () {
      const msg = 'connection timeout'
      const requestError = new Error(msg)
      const mockRequest = sinon.stub().rejects(requestError)
      return expect(provider.fetch(mockRequest, '/foo', {})).to.be.rejectedWith(
        Error,
        'connection timeout'
      )
    })
  })
})
