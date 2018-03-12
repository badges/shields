'use strict';

const { expect } = require('chai');
const sinon = require('sinon');

const BaseService = require('./base');

require('../lib/register-chai-plugins.spec');

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
      expect(mockCamp.route).to.have.been.calledOnce;
      expect(mockCamp.route).to.have.been.calledWith(expectedRouteRegex);
    });

    it('handles the request', async () => {
      expect(mockHandleRequest).to.have.been.calledOnce;
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

      expect(mockSendBadge).to.have.been.calledOnce;
      expect(mockSendBadge).to.have.been.calledWith(
        /*format*/ 'svg',
        {
          text: ['cat', 'Hello bar'],
          colorscheme: 'lightgrey',
          template: undefined,
          logo: undefined,
          logoWidth: NaN,
          links: [],
          colorA: undefined,
        }
      );
    });
  });
});
