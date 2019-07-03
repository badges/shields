'use strict'

const { expect } = require('chai')
const nock = require('nock')
const portfinder = require('portfinder')
const Camp = require('camp')
const got = require('../got-test-client')
const coalesceBadge = require('./coalesce-badge')
const {
  handleRequest,
  clearRequestCache,
  _requestCache,
} = require('./legacy-request-handler')

async function performTwoRequests(baseUrl, first, second) {
  expect((await got(`${baseUrl}${first}`)).statusCode).to.equal(200)
  expect((await got(`${baseUrl}${second}`)).statusCode).to.equal(200)
}

function fakeHandler(queryParams, match, sendBadge, request) {
  const [, someValue, format] = match
  const badgeData = coalesceBadge(
    queryParams,
    {
      label: 'testing',
      message: someValue,
    },
    {}
  )
  sendBadge(format, badgeData)
}

function createFakeHandlerWithCacheLength(cacheLengthSeconds) {
  return function fakeHandler(queryParams, match, sendBadge, request) {
    const [, someValue, format] = match
    const badgeData = coalesceBadge(
      queryParams,
      {
        label: 'testing',
        message: someValue,
      },
      {},
      {
        _cacheLength: cacheLengthSeconds,
      }
    )
    sendBadge(format, badgeData)
  }
}

function fakeHandlerWithNetworkIo(queryParams, match, sendBadge, request) {
  const [, someValue, format] = match
  request('https://www.google.com/foo/bar', (err, res, buffer) => {
    let message
    if (err) {
      message = err.prettyMessage
    } else {
      message = someValue
    }
    const badgeData = coalesceBadge(
      queryParams,
      {
        label: 'testing',
        message,
        format,
      },
      {}
    )
    sendBadge(format, badgeData)
  })
}

describe('The request handler', function() {
  let port, baseUrl
  beforeEach(async function() {
    port = await portfinder.getPortPromise()
    baseUrl = `http://127.0.0.1:${port}`
  })

  let camp
  beforeEach(function(done) {
    camp = Camp.start({ port, hostname: '::' })
    camp.on('listening', () => done())
  })
  afterEach(function(done) {
    clearRequestCache()
    if (camp) {
      camp.close(() => done())
      camp = null
    }
  })

  const standardCacheHeaders = { defaultCacheLengthSeconds: 120 }

  describe('the options object calling style', function() {
    beforeEach(function() {
      camp.route(
        /^\/testing\/([^/]+)\.(svg|png|gif|jpg|json)$/,
        handleRequest(standardCacheHeaders, { handler: fakeHandler })
      )
    })

    it('should return the expected response', async function() {
      const { statusCode, body } = await got(`${baseUrl}/testing/123.json`, {
        json: true,
      })
      expect(statusCode).to.equal(200)
      expect(body).to.deep.equal({
        name: 'testing',
        value: '123',
        label: 'testing',
        message: '123',
        color: 'lightgrey',
        link: [],
      })
    })
  })

  describe('the function shorthand calling style', function() {
    beforeEach(function() {
      camp.route(
        /^\/testing\/([^/]+)\.(svg|png|gif|jpg|json)$/,
        handleRequest(standardCacheHeaders, fakeHandler)
      )
    })

    it('should return the expected response', async function() {
      const { statusCode, body } = await got(`${baseUrl}/testing/123.json`, {
        json: true,
      })
      expect(statusCode).to.equal(200)
      expect(body).to.deep.equal({
        name: 'testing',
        value: '123',
        label: 'testing',
        message: '123',
        color: 'lightgrey',
        link: [],
      })
    })
  })

  describe('the response size limit', function() {
    beforeEach(function() {
      camp.route(
        /^\/testing\/([^/]+)\.(svg|png|gif|jpg|json)$/,
        handleRequest(standardCacheHeaders, {
          handler: fakeHandlerWithNetworkIo,
          fetchLimitBytes: 100,
        })
      )
    })

    it('should not throw an error if the response <= fetchLimitBytes', async function() {
      nock('https://www.google.com')
        .get('/foo/bar')
        .once()
        .reply(200, 'x'.repeat(100))
      const { statusCode, body } = await got(`${baseUrl}/testing/123.json`, {
        json: true,
      })
      expect(statusCode).to.equal(200)
      expect(body).to.deep.equal({
        name: 'testing',
        value: '123',
        label: 'testing',
        message: '123',
        color: 'lightgrey',
        link: [],
      })
    })

    it('should throw an error if the response is > fetchLimitBytes', async function() {
      nock('https://www.google.com')
        .get('/foo/bar')
        .once()
        .reply(200, 'x'.repeat(101))
      const { statusCode, body } = await got(`${baseUrl}/testing/123.json`, {
        json: true,
      })
      expect(statusCode).to.equal(200)
      expect(body).to.deep.equal({
        name: 'testing',
        value: 'Maximum response size exceeded',
        label: 'testing',
        message: 'Maximum response size exceeded',
        color: 'lightgrey',
        link: [],
      })
    })

    afterEach(function() {
      nock.cleanAll()
    })
  })

  describe('caching', function() {
    describe('standard query parameters', function() {
      let handlerCallCount
      beforeEach(function() {
        handlerCallCount = 0
      })

      function register({ cacheHeaderConfig }) {
        camp.route(
          /^\/testing\/([^/]+)\.(svg|png|gif|jpg|json)$/,
          handleRequest(
            cacheHeaderConfig,
            (queryParams, match, sendBadge, request) => {
              ++handlerCallCount
              fakeHandler(queryParams, match, sendBadge, request)
            }
          )
        )
      }

      context('With standard cache settings', function() {
        beforeEach(function() {
          register({ cacheHeaderConfig: standardCacheHeaders })
        })

        it('should cache identical requests', async function() {
          await performTwoRequests(
            baseUrl,
            '/testing/123.svg',
            '/testing/123.svg'
          )
          expect(handlerCallCount).to.equal(1)
        })

        it('should differentiate known query parameters', async function() {
          await performTwoRequests(
            baseUrl,
            '/testing/123.svg?label=foo',
            '/testing/123.svg?label=bar'
          )
          expect(handlerCallCount).to.equal(2)
        })

        it('should ignore unknown query parameters', async function() {
          await performTwoRequests(
            baseUrl,
            '/testing/123.svg?foo=1',
            '/testing/123.svg?foo=2'
          )
          expect(handlerCallCount).to.equal(1)
        })
      })

      it('should set the expires header to current time + defaultCacheLengthSeconds', async function() {
        register({ cacheHeaderConfig: { defaultCacheLengthSeconds: 900 } })
        const { headers } = await got(`${baseUrl}/testing/123.json`)
        const expectedExpiry = new Date(
          +new Date(headers.date) + 900000
        ).toGMTString()
        expect(headers.expires).to.equal(expectedExpiry)
        expect(headers['cache-control']).to.equal('max-age=900')
      })

      it('should set the expected cache headers on cached responses', async function() {
        register({ cacheHeaderConfig: { defaultCacheLengthSeconds: 900 } })

        // Make first request.
        await got(`${baseUrl}/testing/123.json`)

        const { headers } = await got(`${baseUrl}/testing/123.json`)
        const expectedExpiry = new Date(
          +new Date(headers.date) + 900000
        ).toGMTString()
        expect(headers.expires).to.equal(expectedExpiry)
        expect(headers['cache-control']).to.equal('max-age=900')
      })

      it('should let live service data override the default cache headers with longer value', async function() {
        camp.route(
          /^\/testing\/([^/]+)\.(svg|png|gif|jpg|json)$/,
          handleRequest(
            { defaultCacheLengthSeconds: 300 },
            (queryParams, match, sendBadge, request) => {
              ++handlerCallCount
              createFakeHandlerWithCacheLength(400)(
                queryParams,
                match,
                sendBadge,
                request
              )
            }
          )
        )

        const { headers } = await got(`${baseUrl}/testing/123.json`)
        expect(headers['cache-control']).to.equal('max-age=400')
      })

      it('should not let live service data override the default cache headers with shorter value', async function() {
        camp.route(
          /^\/testing\/([^/]+)\.(svg|png|gif|jpg|json)$/,
          handleRequest(
            { defaultCacheLengthSeconds: 300 },
            (queryParams, match, sendBadge, request) => {
              ++handlerCallCount
              createFakeHandlerWithCacheLength(200)(
                queryParams,
                match,
                sendBadge,
                request
              )
            }
          )
        )

        const { headers } = await got(`${baseUrl}/testing/123.json`)
        expect(headers['cache-control']).to.equal('max-age=300')
      })

      it('should set the expires header to current time + cacheSeconds', async function() {
        register({ cacheHeaderConfig: { defaultCacheLengthSeconds: 0 } })
        const { headers } = await got(
          `${baseUrl}/testing/123.json?cacheSeconds=3600`
        )
        const expectedExpiry = new Date(
          +new Date(headers.date) + 3600000
        ).toGMTString()
        expect(headers.expires).to.equal(expectedExpiry)
        expect(headers['cache-control']).to.equal('max-age=3600')
      })

      it('should ignore cacheSeconds when shorter than defaultCacheLengthSeconds', async function() {
        register({ cacheHeaderConfig: { defaultCacheLengthSeconds: 600 } })
        const { headers } = await got(
          `${baseUrl}/testing/123.json?cacheSeconds=300`
        )
        const expectedExpiry = new Date(
          +new Date(headers.date) + 600000
        ).toGMTString()
        expect(headers.expires).to.equal(expectedExpiry)
        expect(headers['cache-control']).to.equal('max-age=600')
      })

      it('should set Cache-Control: no-cache, no-store, must-revalidate if cache seconds is 0', async function() {
        register({ cacheHeaderConfig: { defaultCacheLengthSeconds: 0 } })
        const { headers } = await got(`${baseUrl}/testing/123.json`)
        expect(headers.expires).to.equal(headers.date)
        expect(headers['cache-control']).to.equal(
          'no-cache, no-store, must-revalidate'
        )
      })

      describe('the cache key', function() {
        beforeEach(function() {
          register({ cacheHeaderConfig: standardCacheHeaders })
        })
        const expectedCacheKey = '/testing/123.json?color=123&label=foo'
        it('should match expected and use canonical order - 1', async function() {
          await got(`${baseUrl}/testing/123.json?color=123&label=foo`)
          expect(_requestCache.cache).to.have.keys(expectedCacheKey)
        })
        it('should match expected and use canonical order - 2', async function() {
          await got(`${baseUrl}/testing/123.json?label=foo&color=123`)
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
          handleRequest(standardCacheHeaders, {
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
          baseUrl,
          '/testing/123.svg?foo=1',
          '/testing/123.svg?foo=2'
        )
        expect(handlerCallCount).to.equal(2)
      })
    })
  })
})
