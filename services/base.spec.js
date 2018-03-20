'use strict';

const { expect } = require('chai');
const { test, given, forCases } = require('sazerac');
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
  describe('URL pattern matching', function () {
    const regexExec = str => DummyService._regex.exec(str);
    const getSomeArg = str => {
      const [, someArg] = regexExec(str);
      return someArg;
    };
    const namedParams = str => {
      const match = regexExec(str);
      return DummyService._namedParamsForMatch(match);
    };

    test(regexExec, () => {
      forCases([
        given('/foo/bar.bar.bar.zip'),
        given('/foo/bar/bar.svg'),
      ]).expect(null);
    });

    test(getSomeArg, () => {
      forCases([
        given('/foo/bar.bar.bar.svg'),
        given('/foo/bar.bar.bar.png'),
        given('/foo/bar.bar.bar.gif'),
        given('/foo/bar.bar.bar.jpg'),
        given('/foo/bar.bar.bar.json'),
      ]).expect('bar.bar.bar');
    });

    test(namedParams, () => {
      forCases([
        given('/foo/bar.bar.bar.svg'),
        given('/foo/bar.bar.bar.png'),
        given('/foo/bar.bar.bar.gif'),
        given('/foo/bar.bar.bar.jpg'),
        given('/foo/bar.bar.bar.json'),
      ]).expect({ someArg: 'bar.bar.bar' });
    });
  });

  it('Invokes the handler as expected', async function () {
    const serviceInstance = new DummyService({});
    const serviceData = await serviceInstance.invokeHandler({ someArg: 'bar.bar.bar' });
    expect(serviceData).to.deep.equal({ message: 'Hello bar.bar.bar' });
  });

  describe('Error handling', function () {
    it('Handles internal errors', async function () {
      const serviceInstance = new DummyService({});
      serviceInstance.handle = () => { throw Error("I've made a huge mistake"); };
      const serviceData = await serviceInstance.invokeHandler({ someArg: 'bar.bar.bar' });
      expect(serviceData).to.deep.equal({ message: 'error' });
    });
  });

  describe('_makeBadgeData', function () {
    describe('Overrides', function () {
      it('overrides the label', function () {
        const badgeData = DummyService._makeBadgeData({ label: 'purr count' }, { label: 'purrs' });
        expect(badgeData.text).to.deep.equal(['purr count', 'n/a']);
      });

      it('overrides the color', function () {
        const badgeData = DummyService._makeBadgeData({ colorB: '10ADED' }, { color: 'red' });
        expect(badgeData.colorB).to.equal('#10ADED');
      });
    });

    describe('Service data', function () {
      it('applies the service message', function () {
        const badgeData = DummyService._makeBadgeData({}, { message: '10k' });
        expect(badgeData.text).to.deep.equal(['cat', '10k']);
      });

      it('applies the service color', function () {
        const badgeData = DummyService._makeBadgeData({}, { color: 'red' });
        expect(badgeData.colorscheme).to.equal('red');
      });
    });

    describe('Defaults', function () {
      it('uses the default label', function () {
        const badgeData = DummyService._makeBadgeData({}, {});
        expect(badgeData.text).to.deep.equal(['cat', 'n/a']);
      });

      it('uses the default color', function () {
        const badgeData = DummyService._makeBadgeData({}, {});
        expect(badgeData.colorscheme).to.equal('lightgrey');
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
