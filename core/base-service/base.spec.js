import Joi from 'joi'
import chai from 'chai'
import sinon from 'sinon'
import prometheus from 'prom-client'
import chaiAsPromised from 'chai-as-promised'
import PrometheusMetrics from '../server/prometheus-metrics.js'
import trace from './trace.js'
import {
  NotFound,
  Inaccessible,
  InvalidResponse,
  InvalidParameter,
  Deprecated,
} from './errors.js'
import BaseService from './base.js'
import { MetricHelper, MetricNames } from './metric-helper.js'
import '../register-chai-plugins.spec.js'
const { expect } = chai
chai.use(chaiAsPromised)

const queryParamSchema = Joi.object({
  queryParamA: Joi.string(),
})
  .rename('legacyQueryParamA', 'queryParamA', {
    ignoreUndefined: true,
    override: true,
  })
  .required()

class DummyService extends BaseService {
  static category = 'other'
  static route = { base: 'foo', pattern: ':namedParamA', queryParamSchema }

  static examples = [
    {
      pattern: ':world',
      namedParams: { world: 'World' },
      staticPreview: this.render({ namedParamA: 'foo', queryParamA: 'bar' }),
      keywords: ['hello'],
    },
  ]

  static defaultBadgeData = { label: 'cat', namedLogo: 'appveyor' }

  static render({ namedParamA, queryParamA }) {
    return {
      message: `Hello namedParamA: ${namedParamA} with queryParamA: ${queryParamA}`,
    }
  }

  async handle({ namedParamA }, { queryParamA }) {
    return this.constructor.render({ namedParamA, queryParamA })
  }
}

class DummyServiceWithServiceResponseSizeMetricEnabled extends DummyService {
  static enabledMetrics = [MetricNames.SERVICE_RESPONSE_SIZE]
}

describe('BaseService', function () {
  const defaultConfig = {
    public: {
      handleInternalErrors: false,
      services: {},
    },
    private: {},
  }

  it('Invokes the handler as expected', async function () {
    expect(
      await DummyService.invoke(
        {},
        defaultConfig,
        { namedParamA: 'bar.bar.bar' },
        { queryParamA: '!' }
      )
    ).to.deep.equal({
      message: 'Hello namedParamA: bar.bar.bar with queryParamA: !',
    })
  })

  it('Validates query params', async function () {
    expect(
      await DummyService.invoke(
        {},
        defaultConfig,
        { namedParamA: 'bar.bar.bar' },
        { queryParamA: ['foo', 'bar'] }
      )
    ).to.deep.equal({
      color: 'red',
      isError: true,
      message: 'invalid query parameter: queryParamA',
    })
  })

  describe('Required overrides', function () {
    it('Should throw if render() is not overridden', function () {
      expect(() => BaseService.render()).to.throw(
        /^render\(\) function not implemented for BaseService$/
      )
    })

    it('Should throw if route is not overridden', function () {
      return expect(BaseService.invoke({}, {}, {})).to.be.rejectedWith(
        /^Route not defined for BaseService$/
      )
    })

    class WithRoute extends BaseService {
      static route = {}
    }
    it('Should throw if handle() is not overridden', function () {
      return expect(WithRoute.invoke({}, {}, {})).to.be.rejectedWith(
        /^Handler not implemented for WithRoute$/
      )
    })

    it('Should throw if category is not overridden', function () {
      expect(() => BaseService.category).to.throw(
        /^Category not set for BaseService$/
      )
    })
  })

  describe('Logging', function () {
    beforeEach(function () {
      sinon.stub(trace, 'logTrace')
    })
    afterEach(function () {
      sinon.restore()
    })
    it('Invokes the logger as expected', async function () {
      await DummyService.invoke(
        {},
        defaultConfig,
        { namedParamA: 'bar.bar.bar' },
        { queryParamA: '!' }
      )
      expect(trace.logTrace).to.be.calledWithMatch(
        'inbound',
        sinon.match.string,
        'Service class',
        'DummyService'
      )
      expect(trace.logTrace).to.be.calledWith(
        'inbound',
        sinon.match.string,
        'Named params',
        { namedParamA: 'bar.bar.bar' }
      )
      expect(trace.logTrace).to.be.calledWith(
        'inbound',
        sinon.match.string,
        'Query params after validation',
        { queryParamA: '!' }
      )
    })
  })

  describe('Service data validation', function () {
    it('Allows a link array', async function () {
      const message = 'hello'
      const link = ['https://example.com/', 'https://other.example.com/']
      class LinkService extends DummyService {
        async handle() {
          return { message, link }
        }
      }

      const serviceData = await LinkService.invoke(
        {},
        { handleInternalErrors: false },
        { namedParamA: 'bar.bar.bar' }
      )

      expect(serviceData).to.deep.equal({
        message,
        link,
      })
    })

    context('On invalid data', function () {
      class ThrowingService extends DummyService {
        async handle() {
          return {
            some: 'nonsense',
          }
        }
      }

      it('Throws a validation error on invalid data', async function () {
        try {
          await ThrowingService.invoke(
            {},
            { handleInternalErrors: false },
            { namedParamA: 'bar.bar.bar' }
          )
          expect.fail('Expected to throw')
        } catch (e) {
          expect(e.name).to.equal('ValidationError')
          expect(e.details.map(({ message }) => message)).to.deep.equal([
            '"message" is required',
          ])
        }
      })

      // Ensure debuggabillity.
      // https://github.com/badges/shields/issues/3784
      it('Includes the service class in the stack trace', async function () {
        try {
          await ThrowingService.invoke(
            {},
            { handleInternalErrors: false },
            { namedParamA: 'bar.bar.bar' }
          )
          expect.fail('Expected to throw')
        } catch (e) {
          expect(e.stack).to.include('ThrowingService._validateServiceData')
        }
      })
    })
  })

  describe('Error handling', function () {
    it('Handles internal errors', async function () {
      class ThrowingService extends DummyService {
        async handle() {
          throw Error("I've made a huge mistake")
        }
      }
      expect(
        await ThrowingService.invoke(
          {},
          { handleInternalErrors: true },
          { namedParamA: 'bar.bar.bar' }
        )
      ).to.deep.equal({
        isError: true,
        color: 'lightgray',
        label: 'shields',
        message: 'internal error',
      })
    })

    describe('Handles known subtypes of ShieldsInternalError', function () {
      it('handles NotFound errors', async function () {
        class ThrowingService extends DummyService {
          async handle() {
            throw new NotFound()
          }
        }
        expect(
          await ThrowingService.invoke({}, {}, { namedParamA: 'bar.bar.bar' })
        ).to.deep.equal({
          isError: true,
          color: 'red',
          message: 'not found',
        })
      })

      it('handles Inaccessible errors', async function () {
        class ThrowingService extends DummyService {
          async handle() {
            throw new Inaccessible()
          }
        }
        expect(
          await ThrowingService.invoke({}, {}, { namedParamA: 'bar.bar.bar' })
        ).to.deep.equal({
          isError: true,
          color: 'lightgray',
          message: 'inaccessible',
        })
      })

      it('handles InvalidResponse errors', async function () {
        class ThrowingService extends DummyService {
          async handle() {
            throw new InvalidResponse()
          }
        }
        expect(
          await ThrowingService.invoke({}, {}, { namedParamA: 'bar.bar.bar' })
        ).to.deep.equal({
          isError: true,
          color: 'lightgray',
          message: 'invalid',
        })
      })

      it('handles Deprecated', async function () {
        class ThrowingService extends DummyService {
          async handle() {
            throw new Deprecated()
          }
        }
        expect(
          await ThrowingService.invoke({}, {}, { namedParamA: 'bar.bar.bar' })
        ).to.deep.equal({
          isError: true,
          color: 'lightgray',
          message: 'no longer available',
        })
      })

      it('handles InvalidParameter errors', async function () {
        class ThrowingService extends DummyService {
          async handle() {
            throw new InvalidParameter()
          }
        }
        expect(
          await ThrowingService.invoke({}, {}, { namedParamA: 'bar.bar.bar' })
        ).to.deep.equal({
          isError: true,
          color: 'red',
          message: 'invalid parameter',
        })
      })
    })
  })

  describe('ScoutCamp integration', function () {
    // TODO Strangly, without the useless escape the regexes do not match in Node 12.
    // eslint-disable-next-line no-useless-escape
    const expectedRouteRegex = /^\/foo(?:\/([^\/#\?]+?))(|\.svg|\.json)$/

    let mockCamp
    let mockHandleRequest

    beforeEach(function () {
      mockCamp = {
        route: sinon.spy(),
      }
      mockHandleRequest = sinon.spy()
      DummyService.register(
        { camp: mockCamp, handleRequest: mockHandleRequest },
        defaultConfig
      )
    })

    it('registers the service', function () {
      expect(mockCamp.route).to.have.been.calledOnce
      expect(mockCamp.route).to.have.been.calledWith(expectedRouteRegex)
    })

    it('handles the request', async function () {
      expect(mockHandleRequest).to.have.been.calledOnce

      const { queryParams: serviceQueryParams, handler: requestHandler } =
        mockHandleRequest.getCall(0).args[1]
      expect(serviceQueryParams).to.deep.equal([
        'queryParamA',
        'legacyQueryParamA',
      ])

      const mockSendBadge = sinon.spy()
      const mockRequest = {
        asPromise: sinon.spy(),
      }
      const queryParams = { queryParamA: '?' }
      const match = '/foo/bar.svg'.match(expectedRouteRegex)
      await requestHandler(queryParams, match, mockSendBadge, mockRequest)

      const expectedFormat = 'svg'
      expect(mockSendBadge).to.have.been.calledOnce
      expect(mockSendBadge).to.have.been.calledWith(expectedFormat, {
        label: 'cat',
        message: 'Hello namedParamA: bar with queryParamA: ?',
        color: 'lightgrey',
        style: 'flat',
        namedLogo: undefined,
        logo: undefined,
        logoWidth: undefined,
        logoPosition: undefined,
        links: [],
        labelColor: undefined,
        cacheLengthSeconds: undefined,
      })
    })
  })

  describe('getDefinition', function () {
    it('returns the expected result', function () {
      const { category, name, isDeprecated, route, examples } =
        DummyService.getDefinition()
      expect({
        category,
        name,
        isDeprecated,
        route,
      }).to.deep.equal({
        category: 'other',
        name: 'DummyService',
        isDeprecated: false,
        route: {
          pattern: '/foo/:namedParamA',
          queryParams: ['queryParamA', 'legacyQueryParamA'],
        },
      })
      // The in-depth tests for examples reside in examples.spec.js
      expect(examples).to.have.lengthOf(1)
    })
  })

  describe('validate', function () {
    const dummySchema = Joi.object({
      requiredString: Joi.string().required(),
    }).required()

    it('throws error for invalid responses', function () {
      expect(() =>
        DummyService._validate(
          { requiredString: ['this', "shouldn't", 'work'] },
          dummySchema
        )
      )
        .to.throw()
        .instanceof(InvalidResponse)
    })
  })

  describe('request', function () {
    beforeEach(function () {
      sinon.stub(trace, 'logTrace')
    })
    afterEach(function () {
      sinon.restore()
    })

    it('logs appropriate information', async function () {
      const requestFetcher = async () => ({
        buffer: '',
        res: { statusCode: 200 },
      })
      const serviceInstance = new DummyService(
        { requestFetcher },
        defaultConfig
      )

      const url = 'some-url'
      const options = { headers: { Cookie: 'some-cookie' } }
      await serviceInstance._request({ url, options })

      expect(trace.logTrace).to.be.calledWithMatch(
        'fetch',
        sinon.match.string,
        'Request',
        `${url}\n${JSON.stringify(options, null, 2)}`
      )
      expect(trace.logTrace).to.be.calledWithMatch(
        'fetch',
        sinon.match.string,
        'Response status code',
        200
      )
    })

    it('handles errors', async function () {
      const requestFetcher = async () => ({
        buffer: '',
        res: { statusCode: 404 },
      })
      const serviceInstance = new DummyService(
        { requestFetcher },
        defaultConfig
      )

      try {
        await serviceInstance._request({})
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e).to.be.an.instanceof(NotFound)
        expect(e.message).to.equal('Not Found')
        expect(e.prettyMessage).to.equal('not found')
      }
    })
  })

  describe('Metrics', function () {
    let register
    beforeEach(function () {
      register = new prometheus.Registry()
    })
    const url = 'some-url'

    it('service response size metric is optional', async function () {
      const metricHelper = MetricHelper.create({
        metricInstance: new PrometheusMetrics({ register }),
        ServiceClass: DummyServiceWithServiceResponseSizeMetricEnabled,
      })
      const requestFetcher = async () => ({
        buffer: 'x'.repeat(65536 + 1),
        res: { statusCode: 200 },
      })
      const serviceInstance =
        new DummyServiceWithServiceResponseSizeMetricEnabled(
          { requestFetcher, metricHelper },
          defaultConfig
        )

      await serviceInstance._request({ url })

      expect(await register.getSingleMetricAsString('service_response_bytes'))
        .to.contain(
          'service_response_bytes_bucket{le="65536",category="other",family="undefined",service="dummy_service_with_service_response_size_metric_enabled"} 0\n'
        )
        .and.to.contain(
          'service_response_bytes_bucket{le="131072",category="other",family="undefined",service="dummy_service_with_service_response_size_metric_enabled"} 1\n'
        )
    })

    it('service response size metric is disabled by default', async function () {
      const metricHelper = MetricHelper.create({
        metricInstance: new PrometheusMetrics({ register }),
        ServiceClass: DummyService,
      })
      const requestFetcher = async () => ({
        buffer: 'x',
        res: { statusCode: 200 },
      })
      const serviceInstance = new DummyService(
        { requestFetcher, metricHelper },
        defaultConfig
      )

      await serviceInstance._request({ url })

      expect(
        await register.getSingleMetricAsString('service_response_bytes')
      ).to.not.contain('service_response_bytes_bucket')
    })
  })
  describe('auth', function () {
    class AuthService extends DummyService {
      static auth = {
        passKey: 'myci_pass',
        serviceKey: 'myci',
        isRequired: true,
      }

      async handle() {
        return {
          message: `The CI password is ${this.authHelper._pass}`,
        }
      }
    }

    it('when auth is configured properly, invoke() sets authHelper', async function () {
      expect(
        await AuthService.invoke(
          {},
          {
            public: {
              ...defaultConfig.public,
              services: { myci: { authorizedOrigins: ['https://myci.test'] } },
            },
            private: { myci_pass: 'abc123' },
          },
          { namedParamA: 'bar.bar.bar' }
        )
      ).to.deep.equal({ message: 'The CI password is abc123' })
    })

    it('when auth is not configured properly, invoke() returns inacessible', async function () {
      expect(
        await AuthService.invoke(
          {},
          {
            public: {
              ...defaultConfig.public,
              services: { myci: { authorizedOrigins: ['https://myci.test'] } },
            },
            private: {},
          },
          {
            namedParamA: 'bar.bar.bar',
          }
        )
      ).to.deep.equal({
        color: 'lightgray',
        isError: true,
        message: 'credentials have not been configured',
      })
    })
  })
})
