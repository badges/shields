import { expect } from 'chai'
import portfinder from 'portfinder'
import Camp from '@shields_io/camp'
import got from '../got-test-client.js'
import coalesceBadge from './coalesce-badge.js'
import { handleRequest } from './legacy-request-handler.js'

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

describe('The request handler', function () {
  let port, baseUrl
  beforeEach(async function () {
    port = await portfinder.getPortPromise()
    baseUrl = `http://127.0.0.1:${port}`
  })

  let camp
  beforeEach(function (done) {
    camp = Camp.start({ port, hostname: '::' })
    camp.on('listening', () => done())
  })
  afterEach(function (done) {
    if (camp) {
      camp.close(() => done())
      camp = null
    }
  })

  const standardCacheHeaders = { defaultCacheLengthSeconds: 120 }

  describe('the options object calling style', function () {
    beforeEach(function () {
      camp.route(
        /^\/testing\/([^/]+)\.(svg|png|gif|jpg|json)$/,
        handleRequest(standardCacheHeaders, { handler: fakeHandler })
      )
    })

    it('should return the expected response', async function () {
      const { statusCode, body } = await got(`${baseUrl}/testing/123.json`, {
        responseType: 'json',
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

  describe('the function shorthand calling style', function () {
    beforeEach(function () {
      camp.route(
        /^\/testing\/([^/]+)\.(svg|png|gif|jpg|json)$/,
        handleRequest(standardCacheHeaders, fakeHandler)
      )
    })

    it('should return the expected response', async function () {
      const { statusCode, body } = await got(`${baseUrl}/testing/123.json`, {
        responseType: 'json',
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

  describe('caching', function () {
    describe('standard query parameters', function () {
      function register({ cacheHeaderConfig }) {
        camp.route(
          /^\/testing\/([^/]+)\.(svg|png|gif|jpg|json)$/,
          handleRequest(
            cacheHeaderConfig,
            (queryParams, match, sendBadge, request) => {
              fakeHandler(queryParams, match, sendBadge, request)
            }
          )
        )
      }

      it('should set the expires header to current time + defaultCacheLengthSeconds', async function () {
        register({ cacheHeaderConfig: { defaultCacheLengthSeconds: 900 } })
        const { headers } = await got(`${baseUrl}/testing/123.json`)
        const expectedExpiry = new Date(
          +new Date(headers.date) + 900000
        ).toGMTString()
        expect(headers.expires).to.equal(expectedExpiry)
        expect(headers['cache-control']).to.equal('max-age=900, s-maxage=900')
      })

      it('should set the expected cache headers on cached responses', async function () {
        register({ cacheHeaderConfig: { defaultCacheLengthSeconds: 900 } })

        // Make first request.
        await got(`${baseUrl}/testing/123.json`)

        const { headers } = await got(`${baseUrl}/testing/123.json`)
        const expectedExpiry = new Date(
          +new Date(headers.date) + 900000
        ).toGMTString()
        expect(headers.expires).to.equal(expectedExpiry)
        expect(headers['cache-control']).to.equal('max-age=900, s-maxage=900')
      })

      it('should let live service data override the default cache headers with longer value', async function () {
        camp.route(
          /^\/testing\/([^/]+)\.(svg|png|gif|jpg|json)$/,
          handleRequest(
            { defaultCacheLengthSeconds: 300 },
            (queryParams, match, sendBadge, request) => {
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
        expect(headers['cache-control']).to.equal('max-age=400, s-maxage=400')
      })

      it('should not let live service data override the default cache headers with shorter value', async function () {
        camp.route(
          /^\/testing\/([^/]+)\.(svg|png|gif|jpg|json)$/,
          handleRequest(
            { defaultCacheLengthSeconds: 300 },
            (queryParams, match, sendBadge, request) => {
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
        expect(headers['cache-control']).to.equal('max-age=300, s-maxage=300')
      })

      it('should set the expires header to current time + cacheSeconds', async function () {
        register({ cacheHeaderConfig: { defaultCacheLengthSeconds: 0 } })
        const { headers } = await got(
          `${baseUrl}/testing/123.json?cacheSeconds=3600`
        )
        const expectedExpiry = new Date(
          +new Date(headers.date) + 3600000
        ).toGMTString()
        expect(headers.expires).to.equal(expectedExpiry)
        expect(headers['cache-control']).to.equal('max-age=3600, s-maxage=3600')
      })

      it('should ignore cacheSeconds when shorter than defaultCacheLengthSeconds', async function () {
        register({ cacheHeaderConfig: { defaultCacheLengthSeconds: 600 } })
        const { headers } = await got(
          `${baseUrl}/testing/123.json?cacheSeconds=300`
        )
        const expectedExpiry = new Date(
          +new Date(headers.date) + 600000
        ).toGMTString()
        expect(headers.expires).to.equal(expectedExpiry)
        expect(headers['cache-control']).to.equal('max-age=600, s-maxage=600')
      })

      it('should set Cache-Control: no-cache, no-store, must-revalidate if cache seconds is 0', async function () {
        register({ cacheHeaderConfig: { defaultCacheLengthSeconds: 0 } })
        const { headers } = await got(`${baseUrl}/testing/123.json`)
        expect(headers.expires).to.equal(headers.date)
        expect(headers['cache-control']).to.equal(
          'no-cache, no-store, must-revalidate'
        )
      })
    })

    describe('custom query parameters', function () {
      let handlerCallCount
      beforeEach(function () {
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

      it('should differentiate them', async function () {
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
