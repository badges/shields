'use strict'

const { expect } = require('chai')
const { test, given } = require('sazerac')
const fetch = require('node-fetch')
const config = require('./test-config')
const Camp = require('camp')
const analytics = require('./analytics')
const { makeBadgeData: getBadgeData } = require('./badge-data')
const {
  handleRequest,
  clearRequestCache,
  _requestCache,
  getBadgeMaxAge,
} = require('./request-handler')

const baseUri = `http://127.0.0.1:${config.port}`

async function performTwoRequests(first, second) {
  expect((await fetch(`${baseUri}${first}`)).ok).to.be.true
  expect((await fetch(`${baseUri}${second}`)).ok).to.be.true
}

function fakeHandler(queryParams, match, sendBadge, request) {
  const [, someValue, format] = match
  const badgeData = getBadgeData('testing', queryParams)
  badgeData.text[1] = someValue
  sendBadge(format, badgeData)
}

describe('The request handler', function() {
  before(analytics.load)

  let camp
  const initialBadgeMaxAge = process.env.BADGE_MAX_AGE_SECONDS

  beforeEach(function(done) {
    camp = Camp.start({ port: config.port, hostname: '::' })
    camp.on('listening', () => done())
  })
  afterEach(function(done) {
    clearRequestCache()
    if (camp) {
      camp.close(() => done())
      camp = null
    }
    process.env.BADGE_MAX_AGE_SECONDS = initialBadgeMaxAge
  })

  describe('the options object calling style', function() {
    beforeEach(function() {
      camp.route(
        /^\/testing\/([^/]+)\.(svg|png|gif|jpg|json)$/,
        handleRequest({ handler: fakeHandler })
      )
    })

    it('should return the expected response', async function() {
      const res = await fetch(`${baseUri}/testing/123.json`)
      expect(res.ok).to.be.true
      expect(await res.json()).to.deep.equal({ name: 'testing', value: '123' })
    })
  })

  describe('the function shorthand calling style', function() {
    beforeEach(function() {
      camp.route(
        /^\/testing\/([^/]+)\.(svg|png|gif|jpg|json)$/,
        handleRequest(fakeHandler)
      )
    })

    it('should return the expected response', async function() {
      const res = await fetch(`${baseUri}/testing/123.json`)
      expect(res.ok).to.be.true
      expect(await res.json()).to.deep.equal({ name: 'testing', value: '123' })
    })
  })

  describe('caching', function() {
    describe('standard query parameters', function() {
      let handlerCallCount
      beforeEach(function() {
        handlerCallCount = 0
        camp.route(
          /^\/testing\/([^/]+)\.(svg|png|gif|jpg|json)$/,
          handleRequest((queryParams, match, sendBadge, request) => {
            ++handlerCallCount
            fakeHandler(queryParams, match, sendBadge, request)
          })
        )
      })

      it('should cache identical requests', async function() {
        await performTwoRequests('/testing/123.svg', '/testing/123.svg')
        expect(handlerCallCount).to.equal(1)
      })

      it('should differentiate known query parameters', async function() {
        await performTwoRequests(
          '/testing/123.svg?label=foo',
          '/testing/123.svg?label=bar'
        )
        expect(handlerCallCount).to.equal(2)
      })

      it('should ignore unknown query parameters', async function() {
        await performTwoRequests(
          '/testing/123.svg?foo=1',
          '/testing/123.svg?foo=2'
        )
        expect(handlerCallCount).to.equal(1)
      })

      it('should set the expires header to current time + BADGE_MAX_AGE_SECONDS', async function() {
        process.env.BADGE_MAX_AGE_SECONDS = 900
        const res = await fetch(`${baseUri}/testing/123.json`)
        const expectedExpiry = new Date(
          +new Date(res.headers.get('date')) + 900000
        ).toGMTString()
        expect(res.headers.get('expires')).to.equal(expectedExpiry)
        expect(res.headers.get('cache-control')).to.equal('max-age=900')
      })

      it('should set the expires header to current time + maxAge', async function() {
        process.env.BADGE_MAX_AGE_SECONDS = 0
        const res = await fetch(`${baseUri}/testing/123.json?maxAge=3600`)
        const expectedExpiry = new Date(
          +new Date(res.headers.get('date')) + 3600000
        ).toGMTString()
        expect(res.headers.get('expires')).to.equal(expectedExpiry)
        expect(res.headers.get('cache-control')).to.equal('max-age=3600')
      })

      it('should ignore maxAge if maxAge < BADGE_MAX_AGE_SECONDS', async function() {
        process.env.BADGE_MAX_AGE_SECONDS = 600
        const res = await fetch(`${baseUri}/testing/123.json?maxAge=300`)
        const expectedExpiry = new Date(
          +new Date(res.headers.get('date')) + 600000
        ).toGMTString()
        expect(res.headers.get('expires')).to.equal(expectedExpiry)
        expect(res.headers.get('cache-control')).to.equal('max-age=600')
      })

      it('should set Cache-Control: no-cache, no-store, must-revalidate if maxAge=0', async function() {
        process.env.BADGE_MAX_AGE_SECONDS = 0
        const res = await fetch(`${baseUri}/testing/123.json`)
        expect(res.headers.get('expires')).to.equal(res.headers.get('date'))
        expect(res.headers.get('cache-control')).to.equal(
          'no-cache, no-store, must-revalidate'
        )
      })

      it('should set the expires header to current time + 120 if BADGE_MAX_AGE_SECONDS not set', async function() {
        delete process.env.BADGE_MAX_AGE_SECONDS
        const res = await fetch(`${baseUri}/testing/123.json`)
        const expectedExpiry = new Date(
          +new Date(res.headers.get('date')) + 120000
        ).toGMTString()
        expect(res.headers.get('expires')).to.equal(expectedExpiry)
        expect(res.headers.get('cache-control')).to.equal('max-age=120')
      })

      describe('the cache key', function() {
        const expectedCacheKey = '/testing/123.json?colorB=123&label=foo'
        it('should match expected and use canonical order - 1', async function() {
          const res = await fetch(
            `${baseUri}/testing/123.json?colorB=123&label=foo`
          )
          expect(res.ok).to.be.true
          expect(_requestCache.cache).to.have.keys(expectedCacheKey)
        })
        it('should match expected and use canonical order - 2', async function() {
          const res = await fetch(
            `${baseUri}/testing/123.json?label=foo&colorB=123`
          )
          expect(res.ok).to.be.true
          expect(_requestCache.cache).to.have.keys(expectedCacheKey)
        })
      })
    })

    describe('custom query parameters', function() {
      let handlerCallCount
      beforeEach(function() {
        handlerCallCount = 0
        camp.route(
          /^\/testing\/([^/]+)\.(svg|png|gif|jpg|json)$/,
          handleRequest({
            queryParams: ['foo'],
            handler: (queryParams, match, sendBadge, request) => {
              ++handlerCallCount
              fakeHandler(queryParams, match, sendBadge, request)
            },
          })
        )
      })

      it('should differentiate them', async function() {
        await performTwoRequests(
          '/testing/123.svg?foo=1',
          '/testing/123.svg?foo=2'
        )
        expect(handlerCallCount).to.equal(2)
      })
    })
  })

  describe('getBadgeMaxAge function', function() {
    process.env.BADGE_MAX_AGE_SECONDS = 120
    test(getBadgeMaxAge, () => {
      given({}, {}).expect(120)
      given({ cacheLength: 900 }, {}).expect(900)
      given({ cacheLength: 900 }, { maxAge: 1000 }).expect(1000)
      given({ cacheLength: 900 }, { maxAge: 400 }).expect(900)
    })
  })
})
