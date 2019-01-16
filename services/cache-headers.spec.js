'use strict'

const { test, given } = require('sazerac')
const chai = require('chai')
const { expect } = require('chai')
const sinon = require('sinon')
const httpMocks = require('node-mocks-http')
const {
  coalesceCacheLength,
  setHeadersForCacheLength,
  setCacheHeaders,
  setCacheHeadersForStaticResource,
  serverHasBeenUpSinceResourceCached,
} = require('./cache-headers')

chai.use(require('chai-datetime'))

describe('Cache header functions', function() {
  let res
  beforeEach(function() {
    res = httpMocks.createResponse()
  })

  describe('coalesceCacheLength', function() {
    const cacheHeaderConfig = { defaultCacheLengthSeconds: 777 }
    test(coalesceCacheLength, () => {
      given({ cacheHeaderConfig, queryParams: {} }).expect(777)
      given({
        cacheHeaderConfig,
        serviceDefaultCacheLengthSeconds: 900,
        queryParams: {},
      }).expect(900)
      given({
        cacheHeaderConfig,
        serviceDefaultCacheLengthSeconds: 900,
        queryParams: { maxAge: 1000 },
      }).expect(1000)
      given({
        cacheHeaderConfig,
        serviceDefaultCacheLengthSeconds: 900,
        queryParams: { maxAge: 400 },
      }).expect(900)
      given({
        cacheHeaderConfig,
        serviceDefaultCacheLengthSeconds: 900,
        queryParams: { maxAge: '-1000' },
      }).expect(900)
      given({
        cacheHeaderConfig,
        serviceDefaultCacheLengthSeconds: 900,
        queryParams: { maxAge: '' },
      }).expect(900)
      given({
        cacheHeaderConfig,
        serviceDefaultCacheLengthSeconds: 900,
        queryParams: { maxAge: 'not a number' },
      }).expect(900)
      given({
        cacheHeaderConfig,
        serviceDefaultCacheLengthSeconds: 900,
        serviceOverrideCacheLengthSeconds: 400,
        queryParams: {},
      }).expect(900)
      given({
        cacheHeaderConfig,
        serviceOverrideCacheLengthSeconds: 400,
        queryParams: {},
      }).expect(777)
      given({
        cacheHeaderConfig,
        serviceOverrideCacheLengthSeconds: 900,
        queryParams: {},
      }).expect(900)
      given({
        cacheHeaderConfig,
        serviceOverrideCacheLengthSeconds: 800,
        queryParams: { maxAge: 500 },
      }).expect(800)
      given({
        cacheHeaderConfig,
        serviceOverrideCacheLengthSeconds: 900,
        queryParams: { maxAge: 800 },
      }).expect(900)
    })
  })

  describe('setHeadersForCacheLength', function() {
    let sandbox
    beforeEach(function() {
      sandbox = sinon.createSandbox()
      sandbox.useFakeTimers()
    })
    afterEach(function() {
      sandbox.restore()
      sandbox = undefined
    })

    it('should set the correct Date header', function() {
      // Confidence check.
      expect(res._headers.date).to.equal(undefined)

      // Act.
      setHeadersForCacheLength(res, 123)

      // Assert.
      const now = new Date().toGMTString()
      expect(res._headers.date).to.equal(now)
    })

    context('cacheLengthSeconds is zero', function() {
      beforeEach(function() {
        setHeadersForCacheLength(res, 0)
      })

      it('should set the expected Cache-Control header', function() {
        expect(res._headers['cache-control']).to.equal(
          'no-cache, no-store, must-revalidate'
        )
      })

      it('should set the expected Expires header', function() {
        expect(res._headers.expires).to.equal(new Date().toGMTString())
      })
    })

    context('cacheLengthSeconds is nonzero', function() {
      beforeEach(function() {
        setHeadersForCacheLength(res, 123)
      })

      it('should set the expected Cache-Control header', function() {
        expect(res._headers['cache-control']).to.equal('max-age=123')
      })

      it('should set the expected Expires header', function() {
        const expires = new Date(Date.now() + 123 * 1000).toGMTString()
        expect(res._headers.expires).to.equal(expires)
      })
    })
  })

  describe('setCacheHeaders', function() {
    it('sets the expected fields', function() {
      const expectedFields = ['date', 'cache-control', 'expires']
      expectedFields.forEach(field =>
        expect(res._headers[field]).to.equal(undefined)
      )

      setCacheHeaders({
        cacheHeaderConfig: { defaultCacheLengthSeconds: 1234 },
        serviceDefaultCacheLengthSeconds: 567,
        queryParams: { maxAge: 999999 },
        res,
      })

      expectedFields.forEach(field =>
        expect(res._headers[field])
          .to.be.a('string')
          .and.have.lengthOf.at.least(1)
      )
    })
  })

  describe('setCacheHeadersForStaticResource', function() {
    beforeEach(function() {
      setCacheHeadersForStaticResource(res)
    })

    it('should set the expected Cache-Control header', function() {
      expect(res._headers['cache-control']).to.equal(`max-age=${24 * 3600}`)
    })

    it('should set the expected Last-Modified header', function() {
      const lastModified = res._headers['last-modified']
      expect(new Date(lastModified)).to.be.withinTime(
        // Within the last 60 seconds.
        new Date(Date.now() - 60 * 1000),
        new Date()
      )
    })
  })

  describe('serverHasBeenUpSinceResourceCached', function() {
    // The stringified req's are hard to understand. I thought Sazerac
    // provided a way to override the describe message, though I can't find it.
    context('when there is no If-Modified-Since header', function() {
      it('returns false', function() {
        const req = httpMocks.createRequest()
        expect(serverHasBeenUpSinceResourceCached(req)).to.equal(false)
      })
    })
    context('when the If-Modified-Since header is invalid', function() {
      it('returns false', function() {
        const req = httpMocks.createRequest({
          headers: { 'If-Modified-Since': 'this-is-not-a-date' },
        })
        expect(serverHasBeenUpSinceResourceCached(req)).to.equal(false)
      })
    })
    context(
      'when the If-Modified-Since header is before the process started',
      function() {
        it('returns false', function() {
          const req = httpMocks.createRequest({
            headers: { 'If-Modified-Since': '2018-02-01T05:00:00.000Z' },
          })
          expect(serverHasBeenUpSinceResourceCached(req)).to.equal(false)
        })
      }
    )
    context(
      'when the If-Modified-Since header is after the process started',
      function() {
        it('returns true', function() {
          const modifiedTimeStamp = new Date(Date.now() + 1800000)
          const req = httpMocks.createRequest({
            headers: { 'If-Modified-Since': modifiedTimeStamp.toISOString() },
          })
          expect(serverHasBeenUpSinceResourceCached(req)).to.equal(true)
        })
      }
    )
  })
})
