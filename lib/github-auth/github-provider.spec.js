'use strict';

const assert = require('assert');
const sinon = require('sinon');
const GithubProvider = require('./github-provider');

describe('Github API provider', function () {
  const baseUri = 'https://github-api.example.com';
  const reserveFraction = 0.333;

  let mockToken, mockSearchToken, mockTokenProvider, provider;
  beforeEach(function () {
    mockToken = { update: sinon.spy(), invalidate: sinon.spy() };
    mockSearchToken = { update: sinon.spy(), invalidate: sinon.spy() };
    mockTokenProvider = {
      nextToken: sinon.stub().returns(mockToken),
      nextSearchToken: sinon.stub().returns(mockSearchToken),
    };
    provider = new GithubProvider(baseUri, mockTokenProvider);
    provider.reserveFraction = reserveFraction;
  });

  context('a search API request', function () {
    const mockRequest = (options, callback) => { callback() };
    it('should obtain an appropriate token', function (done) {
      provider.request(mockRequest, '/search', {}, (err, res, buffer) => {
        assert.equal(err, null);
        assert.ok(mockTokenProvider.nextSearchToken.calledOnce);
        assert.ok(mockTokenProvider.nextToken.notCalled);
        done();
      });
    });
  });

  context('a core API request', function () {
    const mockRequest = (options, callback) => { callback() };
    it('should obtain an appropriate token', function (done) {
      provider.request(mockRequest, '/repo', {}, (err, res, buffer) => {
        assert.equal(err, null);
        assert.ok(mockTokenProvider.nextToken.calledOnce);
        assert.ok(mockTokenProvider.nextSearchToken.notCalled);
        done();
      });
    });
  });

  context('a valid response', function () {
    const rateLimit = 12500;
    const remaining = 7955;
    const nextReset = 123456789;
    const mockResponse = {
      statusCode: 200,
      headers: {
        'x-ratelimit-limit': rateLimit,
        'x-ratelimit-remaining': remaining,
        'x-ratelimit-reset': nextReset,
      },
    };
    const mockBuffer = Buffer.alloc(0);
    const mockRequest = (options, callback) => {
      callback(null, mockResponse, mockBuffer);
    };

    it('should invoke the callback', function (done) {
      provider.request(mockRequest, '/foo', {}, (err, res, buffer) => {
        assert.equal(err, null);
        assert.ok(Object.is(res, mockResponse));
        assert.ok(Object.is(buffer, mockBuffer));
        done();
      });
    });

    it('should update the token with the expected values', function (done) {
      provider.request(mockRequest, '/foo', {}, (err, res, buffer) => {
        assert.equal(err, null);
        const expectedUsesRemaining = remaining - reserveFraction * rateLimit;
        assert.ok(mockToken.update.withArgs(expectedUsesRemaining, nextReset).calledOnce);
        assert.ok(mockToken.invalidate.notCalled);
        done();
      });
    });
  });

  context('an unauthorized response', function () {
    const mockResponse = { statusCode: 401 };
    const mockBuffer = Buffer.alloc(0);
    const mockRequest = (options, callback) => {
      callback(null, mockResponse, mockBuffer);
    };

    it('should update the token with the expected values', function (done) {
      provider.request(mockRequest, '/foo', {}, (err, res, buffer) => {
        assert.equal(err, null);
        assert.ok(mockToken.invalidate.calledOnce);
        assert.ok(mockToken.update.notCalled);
        done();
      });
    });
  });
});
