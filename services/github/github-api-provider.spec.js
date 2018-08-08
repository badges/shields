'use strict'

const { expect } = require('chai')
const GithubApiProvider = require('./github-api-provider')

describe('Github API provider', function() {
  const baseUrl = 'https://github-api.example.com'

  let provider
  beforeEach(function() {
    provider = new GithubApiProvider({ baseUrl })
  })

  context('a valid response', function() {
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

    it('should invoke the callback', function(done) {
      provider.request(mockRequest, '/foo', {}, (err, res, buffer) => {
        expect(err).to.equal(null)
        expect(Object.is(res, mockResponse)).to.be.true
        expect(Object.is(buffer, mockBuffer)).to.be.true
        done()
      })
    })
  })

  context('an unauthorized response', function() {
    const mockResponse = { statusCode: 401 }
    const mockBuffer = Buffer.alloc(0)
    const mockRequest = (...args) => {
      const callback = args.pop()
      callback(null, mockResponse, mockBuffer)
    }

    it('should invoke the callback', function(done) {
      provider.request(mockRequest, '/foo', {}, (err, res, buffer) => {
        expect(err).to.equal(null)
        // Add more?
        done()
      })
    })
  })

  context('a connection error', function() {
    const mockRequest = (...args) => {
      const callback = args.pop()
      callback(Error('connection timeout'))
    }

    it('should pass the error to the callback', function(done) {
      provider.request(mockRequest, '/foo', {}, (err, res, buffer) => {
        expect(err).to.be.an.instanceof(Error)
        expect(err.message).to.equal('connection timeout')
        done()
      })
    })
  })
})
