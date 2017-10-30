'use strict';

const assert = require('assert');
const fetch = require('node-fetch');
const config = require('./test-config');
const Camp = require('camp');
const analytics = require('./analytics');
const { makeBadgeData: getBadgeData } = require('./badge-data');
const {
  handleRequest,
  clearRequestCache,
  _requestCache
} = require('./request-handler');

const baseUri = `http://127.0.0.1:${config.port}`;

function performTwoRequests (first, second) {
  return fetch(`${baseUri}${first}`)
    .then(res => {
      assert.ok(res.ok);
      return fetch(`${baseUri}${second}`)
        .then(res => {
          assert.ok(res.ok);
        })
    });
}

function fakeHandler(queryParams, match, sendBadge, request) {
  const [, someValue, format] = match;
  const badgeData = getBadgeData('testing', queryParams);
  badgeData.text[1] = someValue;
  sendBadge(format, badgeData);
}

describe('The request handler', function() {
  before(analytics.load);

  let camp;
  beforeEach(function (done) {
    camp = Camp.start({ port: config.port, hostname: '::' });
    camp.on('listening', () => done());
  });
  afterEach(function (done) {
    clearRequestCache();
    if (camp) {
      camp.close(() => done());
      camp = null;
    }
  });

  describe('the options object calling style', function() {
    beforeEach(function () {
      camp.route(/^\/testing\/([^/]+)\.(svg|png|gif|jpg|json)$/,
        handleRequest({ handler: fakeHandler }));
    });

    it('should return the expected response', function () {
      return fetch(`${baseUri}/testing/123.json`)
        .then(res => {
          assert.ok(res.ok);
          return res.json();
        }).then(json => {
          assert.deepEqual(json, { name: 'testing', value: '123' });
        });
    });
  });

  describe('the function shorthand calling style', function() {
    beforeEach(function () {
      camp.route(/^\/testing\/([^/]+)\.(svg|png|gif|jpg|json)$/,
        handleRequest(fakeHandler));
    });

    it('should return the expected response', function () {
      return fetch(`${baseUri}/testing/123.json`)
        .then(res => {
          assert.ok(res.ok);
          return res.json();
        }).then(json => {
          assert.deepEqual(json, { name: 'testing', value: '123' });
        });
    });
  });

  describe('caching', function () {

    describe('standard query parameters', function () {
      let handlerCallCount;
      beforeEach(function () {
        handlerCallCount = 0;
        camp.route(/^\/testing\/([^/]+)\.(svg|png|gif|jpg|json)$/,
          handleRequest((queryParams, match, sendBadge, request) => {
            ++handlerCallCount;
            fakeHandler(queryParams, match, sendBadge, request);
          }));
      });

      it('should cache identical requests', function () {
        return performTwoRequests('/testing/123.svg', '/testing/123.svg').then(() => {
          assert.equal(handlerCallCount, 1);
        });
      });

      it('should differentiate known query parameters', function () {
        return performTwoRequests(
          '/testing/123.svg?label=foo',
          '/testing/123.svg?label=bar'
        ).then(() => { assert.equal(handlerCallCount, 2); });
      });

      it('should ignore unknown query parameters', function () {
        return performTwoRequests(
          '/testing/123.svg?foo=1',
          '/testing/123.svg?foo=2'
        ).then(() => { assert.equal(handlerCallCount, 1); });
      });

      describe('the cache key', function () {
        const expectedCacheKey = '/testing/123.json?colorB=123&label=foo';
        it('should match expected and use canonical order - 1', function () {
          return fetch(`${baseUri}/testing/123.json?colorB=123&label=foo`)
            .then(res => {
              assert.ok(res.ok);
              assert.deepEqual([..._requestCache.cache.keys()], [expectedCacheKey]);
            });
        });
        it('should match expected and use canonical order - 2', function () {
          return fetch(`${baseUri}/testing/123.json?label=foo&colorB=123`)
            .then(res => {
              assert.ok(res.ok);
              assert.deepEqual([..._requestCache.cache.keys()], [expectedCacheKey]);
            });
        });
      });
    });

    describe('custom query parameters', function() {
      let handlerCallCount;
      beforeEach(function () {
        handlerCallCount = 0;
        camp.route(/^\/testing\/([^/]+)\.(svg|png|gif|jpg|json)$/,
          handleRequest({
            queryParams: ['foo'],
            handler: (queryParams, match, sendBadge, request) => {
              ++handlerCallCount;
              fakeHandler(queryParams, match, sendBadge, request);
            },
          }))
      });

      it('should differentiate them', function () {
        return performTwoRequests(
          '/testing/123.svg?foo=1',
          '/testing/123.svg?foo=2'
        ).then(() => { assert.equal(handlerCallCount, 2); });
      });
    });
  });
});
