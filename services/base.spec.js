'use strict';

const assert = require('assert');
const { expect } = require('chai');
const sinon = require('sinon');

const BaseService = require('./base');

class DummyService extends BaseService {
  async handle({someArg}) {
    return {
      message: 'Hello ' + someArg,
    };
  }

  static get category() { return 'cat'; }
  static get uri() {
    return {
      format: '/foo/([^/]+)',
      capture: ['someArg']
    };
  }
}

describe('BaseService', () => {
  describe('_makeBadgeData', function () {
    describe('Overrides', function () {
      it('overrides the label', function () {
        const badgeData = DummyService._makeBadgeData({ label: 'purr count' }, { label: 'purrs' });
        expect(badgeData.text).to.deep.equal(['purr count', 'n/a']);
      });
    });

    describe('Service data', function () {
      it('applies the service message', function () {
        const badgeData = DummyService._makeBadgeData({}, { message: '10k' });
        expect(badgeData.text).to.deep.equal(['cat', '10k']);
      });
    });

    describe('Defaults', function () {
      it('uses the default label', function () {
        const badgeData = DummyService._makeBadgeData({}, {});
        expect(badgeData.text).to.deep.equal(['cat', 'n/a']);
      });
    });
  });

  describe('ScoutCamp integration', function () {
    const expectedRouteRegex = /^\/foo\/([^/]+).(svg|png|gif|jpg|json)$/;

    let mockCamp;
    let mockHandleRequest;

    beforeEach(() => {
      mockCamp = {
        route: sinon.spy(),
      };
      mockHandleRequest = sinon.spy();
      DummyService.register(mockCamp, mockHandleRequest);
    });

    it('registers the service', () => {
      assert(mockCamp.route.calledOnce);
      assert.equal(mockCamp.route.getCall(0).args[0].toString(), expectedRouteRegex);
    });

    it('handles the request', async () => {
      assert(mockHandleRequest.calledOnce);
      const requestHandler = mockHandleRequest.getCall(0).args[0];

      const mockSendBadge = sinon.spy();
      const mockRequest = {
        asPromise: sinon.spy(),
      };
      await requestHandler(
        /*data*/ {},
        /*match*/ '/foo/bar.svg'.match(expectedRouteRegex),
        mockSendBadge,
        mockRequest
      );

      assert(mockSendBadge.calledOnce);
      assert(mockSendBadge.calledWith(
        /*format*/ 'svg',
        {
          text: ['cat', 'Hello bar'],
          colorscheme: 'lightgrey',
          template: 'default',
          logo: undefined,
          logoWidth: NaN,
          links: [],
          colorA: undefined,
        }
      ));
    });
  });
});
