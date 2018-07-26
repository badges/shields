'use strict';

const { expect } = require('chai');
const sinon = require('sinon');
const GithubProvider = require('./github-provider');

describe('Github API provider', function() {
  const baseUri = 'https://github-api.example.com';
  const reserveFraction = 0.333;

  let mockToken, mockSearchToken, mockTokenProvider, provider;
  beforeEach(function() {
    mockToken = { update: sinon.spy(), invalidate: sinon.spy() };
    mockSearchToken = { update: sinon.spy(), invalidate: sinon.spy() };
    mockTokenProvider = {
      nextToken: sinon.stub().returns(mockToken),
      nextSearchToken: sinon.stub().returns(mockSearchToken),
    };
    provider = new GithubProvider(baseUri, mockTokenProvider);
    provider.reserveFraction = reserveFraction;
  });

  context('a search API request', function() {
    const mockRequest = (options, callback) => {
      callback();
    };
    it('should obtain an appropriate token', function(done) {
      provider.request(mockRequest, '/search', {}, (err, res, buffer) => {
        expect(err).to.be.undefined;
        expect(mockTokenProvider.nextSearchToken).to.have.been.calledOnce;
        expect(mockTokenProvider.nextToken).not.to.have.been.called;
        done();
      });
    });
  });

  context('a core API request', function() {
    const mockRequest = (options, callback) => {
      callback();
    };
    it('should obtain an appropriate token', function(done) {
      provider.request(mockRequest, '/repo', {}, (err, res, buffer) => {
        expect(err).to.be.undefined;
        expect(mockTokenProvider.nextSearchToken).not.to.have.been.called;
        expect(mockTokenProvider.nextToken).to.have.been.calledOnce;
        done();
      });
    });
  });

  context('a valid response', function() {
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

    it('should invoke the callback', function(done) {
      provider.request(mockRequest, '/foo', {}, (err, res, buffer) => {
        expect(err).to.equal(null);
        expect(Object.is(res, mockResponse)).to.be.true;
        expect(Object.is(buffer, mockBuffer)).to.be.true;
        done();
      });
    });

    it('should update the token with the expected values', function(done) {
      provider.request(mockRequest, '/foo', {}, (err, res, buffer) => {
        expect(err).to.equal(null);
        const expectedUsesRemaining = remaining - reserveFraction * rateLimit;
        expect(
          mockToken.update.withArgs(expectedUsesRemaining, nextReset).calledOnce
        ).to.be.true;
        expect(mockToken.invalidate).not.to.have.been.called;
        done();
      });
    });
  });

  context('an unauthorized response', function() {
    const mockResponse = { statusCode: 401 };
    const mockBuffer = Buffer.alloc(0);
    const mockRequest = (options, callback) => {
      callback(null, mockResponse, mockBuffer);
    };

    it('should update the token with the expected values', function(done) {
      provider.request(mockRequest, '/foo', {}, (err, res, buffer) => {
        expect(err).to.equal(null);
        expect(mockToken.invalidate).to.have.been.calledOnce;
        expect(mockToken.update).not.to.have.been.called;
        done();
      });
    });
  });
});
