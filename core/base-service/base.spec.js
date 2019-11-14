'use strict'

const Joi = require('@hapi/joi')
const { expect } = require('chai')
const sinon = require('sinon')
const trace = require('./trace')
const {
  NotFound,
  Inaccessible,
  InvalidResponse,
  InvalidParameter,
  Deprecated,
} = require('./errors')
const BaseService = require('./base')

require('../register-chai-plugins.spec')

const queryParamSchema = Joi.object({
  queryParamA: Joi.string(),
})
  .rename('legacyQueryParamA', 'queryParamA', {
    ignoreUndefined: true,
    override: true,
  })
  .required()

class DummyService extends BaseService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'foo',
      pattern: ':namedParamA',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        pattern: ':world',
        namedParams: { world: 'World' },
        staticPreview: this.render({ namedParamA: 'foo', queryParamA: 'bar' }),
        keywords: ['hello'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'cat', namedLogo: 'appveyor' }
  }

  static render({ namedParamA, queryParamA }) {
    return {
      message: `Hello namedParamA: ${namedParamA} with queryParamA: ${queryParamA}`,
    }
  }

  async handle({ namedParamA }, { queryParamA }) {
    return this.constructor.render({ namedParamA, queryParamA })
  }
}

describe('BaseService', function() {
  const defaultConfig = { handleInternalErrors: false, private: {} }

  it('Invokes the handler as expected', async function() {
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

  it('Validates query params', async function() {
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

  describe('Required overrides', function() {
    it('Should throw if render() is not overridden', function() {
      expect(() => BaseService.render()).to.throw(
        'render() function not implemented for BaseService'
      )
    })

    it('Should throw if route is not overridden', async function() {
      try {
        await BaseService.invoke({}, {}, {})
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e.message).to.equal('Route not defined for BaseService')
      }
    })

    class WithRoute extends BaseService {
      static get route() {
        return {}
      }
    }
    it('Should throw if handle() is not overridden', async function() {
      try {
        await WithRoute.invoke({}, {}, {})
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e.message).to.equal('Handler not implemented for WithRoute')
      }
    })

    it('Should throw if category is not overridden', function() {
      expect(() => BaseService.category).to.throw(
        'Category not set for BaseService'
      )
    })
  })

  describe('Logging', function() {
    let sandbox
    beforeEach(function() {
      sandbox = sinon.createSandbox()
    })
    afterEach(function() {
      sandbox.restore()
    })
    beforeEach(function() {
      sandbox.stub(trace, 'logTrace')
    })
    it('Invokes the logger as expected', async function() {
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

  describe('Service data validation', function() {
    it('Allows a link array', async function() {
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

    context('On invalid data', function() {
      class ThrowingService extends DummyService {
        async handle() {
          return {
            some: 'nonsense',
          }
        }
      }

      it('Throws a validation error on invalid data', async function() {
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
      it('Includes the service class in the stack trace', async function() {
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

  describe('Error handling', function() {
    it('Handles internal errors', async function() {
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

    describe('Handles known subtypes of ShieldsInternalError', function() {
      it('handles NotFound errors', async function() {
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

      it('handles Inaccessible errors', async function() {
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

      it('handles InvalidResponse errors', async function() {
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

      it('handles Deprecated', async function() {
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

      it('handles InvalidParameter errors', async function() {
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

  describe('ScoutCamp integration', function() {
    // TODO Strangly, without the useless escape the regexes do not match in Node 12.
    // eslint-disable-next-line no-useless-escape
    const expectedRouteRegex = /^\/foo\/([^\/]+?)(|\.svg|\.json)$/

    let mockCamp
    let mockHandleRequest

    beforeEach(function() {
      mockCamp = {
        route: sinon.spy(),
      }
      mockHandleRequest = sinon.spy()
      DummyService.register(
        { camp: mockCamp, handleRequest: mockHandleRequest },
        defaultConfig
      )
    })

    it('registers the service', function() {
      expect(mockCamp.route).to.have.been.calledOnce
      expect(mockCamp.route).to.have.been.calledWith(expectedRouteRegex)
    })

    it('handles the request', async function() {
      expect(mockHandleRequest).to.have.been.calledOnce

      const {
        queryParams: serviceQueryParams,
        handler: requestHandler,
      } = mockHandleRequest.getCall(0).args[1]
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
        text: ['cat', 'Hello namedParamA: bar with queryParamA: ?'],
        color: 'lightgrey',
        template: undefined,
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

  describe('getDefinition', function() {
    it('returns the expected result', function() {
      const {
        category,
        name,
        isDeprecated,
        route,
        examples,
      } = DummyService.getDefinition()
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

  describe('validate', function() {
    const dummySchema = Joi.object({
      requiredString: Joi.string().required(),
    }).required()

    it('throws error for invalid responses', async function() {
      try {
        DummyService._validate(
          { requiredString: ['this', "shouldn't", 'work'] },
          dummySchema
        )
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e).to.be.an.instanceof(InvalidResponse)
      }
    })
  })

  describe('request', function() {
    let sandbox
    beforeEach(function() {
      sandbox = sinon.createSandbox()
    })
    afterEach(function() {
      sandbox.restore()
    })
    beforeEach(function() {
      sandbox.stub(trace, 'logTrace')
    })

    it('logs appropriate information', async function() {
      const sendAndCacheRequest = async () => ({
        buffer: '',
        res: { statusCode: 200 },
      })
      const serviceInstance = new DummyService(
        { sendAndCacheRequest },
        defaultConfig
      )

      const url = 'some-url'
      const options = { headers: { Cookie: 'some-cookie' } }
      await serviceInstance._request({ url, options })

      expect(trace.logTrace).to.be.calledWithMatch(
        'fetch',
        sinon.match.string,
        'Request',
        url,
        '\n',
        options
      )
      expect(trace.logTrace).to.be.calledWithMatch(
        'fetch',
        sinon.match.string,
        'Response status code',
        200
      )
    })

    it('handles errors', async function() {
      const sendAndCacheRequest = async () => ({
        buffer: '',
        res: { statusCode: 404 },
      })
      const serviceInstance = new DummyService(
        { sendAndCacheRequest },
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

  describe('auth', function() {
    class AuthService extends DummyService {
      static get auth() {
        return {
          passKey: 'myci_pass',
          isRequired: true,
        }
      }

      async handle() {
        return {
          message: `The CI password is ${this.authHelper.pass}`,
        }
      }
    }

    it('when auth is configured properly, invoke() sets authHelper', async function() {
      expect(
        await AuthService.invoke(
          {},
          { defaultConfig, private: { myci_pass: 'abc123' } },
          { namedParamA: 'bar.bar.bar' }
        )
      ).to.deep.equal({ message: 'The CI password is abc123' })
    })

    it('when auth is not configured properly, invoke() returns inacessible', async function() {
      expect(
        await AuthService.invoke({}, defaultConfig, {
          namedParamA: 'bar.bar.bar',
        })
      ).to.deep.equal({
        color: 'lightgray',
        isError: true,
        message: 'credentials have not been configured',
      })
    })
  })
})
