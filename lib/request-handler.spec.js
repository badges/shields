'use strict';

const assert = require('assert');
const fetch = require('node-fetch');
const config = require('./test-config');
const Camp = require('camp');
const { analyticsAutoLoad } = require('./analytics');
const { makeBadgeData: getBadgeData } = require('./badge-data');
const {
  handleRequest,
  clearRequestCache
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

describe.only('The request handler', function() {
  before(function () {
    analyticsAutoLoad();
  });

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

  let handlerCallCount;
  beforeEach(function () {
    handlerCallCount = 0;
    camp.route(/^\/testing\/([^/]+)\.(svg|png|gif|jpg|json)$/,
      handleRequest((queryParams, match, sendBadge, request) => {
        ++handlerCallCount;
        const [, someValue, format] = match;
        const badgeData = getBadgeData('testing', queryParams);
        badgeData.text[1] = someValue;
        sendBadge(format, badgeData);
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
});
