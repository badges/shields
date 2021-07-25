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
    const mockRequest = (options, callback) => {
      callback()
    }
    it('should obtain an appropriate token', function (done) {
      provider.request(mockRequest, '/search', {}, (err, res, buffer) => {
        expect(err).to.be.undefined
        expect(provider.searchTokens.next).to.have.been.calledOnce
        expect(provider.standardTokens.next).not.to.have.been.called
        expect(provider.graphqlTokens.next).not.to.have.been.called
        done()
      })
    })
  })

  context('a graphql API request', function () {
    const mockRequest = (options, callback) => {
      callback()
    }
    it('should obtain an appropriate token', function (done) {
      provider.request(mockRequest, '/graphql', {}, (err, res, buffer) => {
        expect(err).to.be.undefined
        expect(provider.searchTokens.next).not.to.have.been.called
        expect(provider.standardTokens.next).not.to.have.been.called
        expect(provider.graphqlTokens.next).to.have.been.calledOnce
        done()
      })
    })
  })

  context('a core API request', function () {
    const mockRequest = (options, callback) => {
      callback()
    }
    it('should obtain an appropriate token', function (done) {
      provider.request(mockRequest, '/repo', {}, (err, res, buffer) => {
        expect(err).to.be.undefined
        expect(provider.searchTokens.next).not.to.have.been.called
        expect(provider.standardTokens.next).to.have.been.calledOnce
        expect(provider.graphqlTokens.next).not.to.have.been.called
        done()
      })
    })
  })

  context('a valid V3 API response', function () {
    const rateLimit = 12500
    const remaining = 7955
    const nextReset = 123456789
    const mockResponse = {
      statusCode: 200,
      headers: {
        'x-ratelimit-limit': rateLimit,
        'x-ratelimit-remaining': remaining,
        'x-ratelimit-reset': nextReset,
      },
    }
    const mockBuffer = Buffer.alloc(0)
    const mockRequest = (...args) => {
      const callback = args.pop()
      callback(null, mockResponse, mockBuffer)
    }

    it('should invoke the callback', function (done) {
      provider.request(mockRequest, '/foo', {}, (err, res, buffer) => {
        expect(err).to.equal(null)
        expect(Object.is(res, mockResponse)).to.be.true
        expect(Object.is(buffer, mockBuffer)).to.be.true
        done()
      })
    })

    it('should update the token with the expected values', function (done) {
      provider.request(mockRequest, '/foo', {}, (err, res, buffer) => {
        expect(err).to.equal(null)
        const expectedUsesRemaining =
          remaining - Math.ceil(reserveFraction * rateLimit)
        expect(mockStandardToken.update).to.have.been.calledWith(
          expectedUsesRemaining,
          nextReset
        )
        expect(mockStandardToken.invalidate).not.to.have.been.called
        done()
      })
    })
  })

  context('a valid V4 API response', function () {
    const rateLimit = 12500
    const remaining = 7955
    const nextReset = 123456789
    const mockResponse = {
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
    }
    const mockBuffer = Buffer.alloc(0)
    const mockRequest = (...args) => {
      const callback = args.pop()
      callback(null, mockResponse, mockBuffer)
    }

    it('should invoke the callback', function (done) {
      provider.request(mockRequest, '/graphql', {}, (err, res, buffer) => {
        expect(err).to.equal(null)
        expect(Object.is(res, mockResponse)).to.be.true
        expect(Object.is(buffer, mockBuffer)).to.be.true
        done()
      })
    })

    it('should update the token with the expected values', function (done) {
      provider.request(mockRequest, '/graphql', {}, (err, res, buffer) => {
        expect(err).to.equal(null)
        const expectedUsesRemaining =
          remaining - Math.ceil(reserveFraction * rateLimit)
        expect(mockGraphqlToken.update).to.have.been.calledWith(
          expectedUsesRemaining,
          nextReset
        )
        expect(mockGraphqlToken.invalidate).not.to.have.been.called
        done()
      })
    })
  })

  context('an unauthorized response', function () {
    const mockResponse = { statusCode: 401 }
    const mockBuffer = Buffer.alloc(0)
    const mockRequest = (...args) => {
      const callback = args.pop()
      callback(null, mockResponse, mockBuffer)
    }

    it('should invoke the callback and update the token with the expected values', function (done) {
      provider.request(mockRequest, '/foo', {}, (err, res, buffer) => {
        expect(err).to.equal(null)
        expect(mockStandardToken.invalidate).to.have.been.calledOnce
        expect(mockStandardToken.update).not.to.have.been.called
        done()
      })
    })
  })

  context('a connection error', function () {
    const mockRequest = (...args) => {
      const callback = args.pop()
      callback(Error('connection timeout'))
    }

    it('should pass the error to the callback', function (done) {
      provider.request(mockRequest, '/foo', {}, (err, res, buffer) => {
        expect(err).to.be.an.instanceof(Error)
        expect(err.message).to.equal('connection timeout')
        done()
      })
    })
  })
})
