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
      expect(mockCamp.route.getCall(0).args[0].toString()).to.equal(expectedRouteRegex.toString());
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
          message: 'Hello bar',
          text: ['cat', 'Hello bar'],
          colorscheme: 'lightgrey',
          template: 'default',
          logo: undefined,
          logoWidth: NaN,
          links: [],
          colorA: undefined,
          colorB: undefined,
        }
      );
    });
  });
});
