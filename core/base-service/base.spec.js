'use strict'

const Joi = require('joi')
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

class DummyService extends BaseService {
  static render({ namedParamA, queryParamA }) {
    return {
      message: `Hello namedParamA: ${namedParamA} with queryParamA: ${queryParamA}`,
    }
  }

  async handle({ namedParamA }, { queryParamA }) {
    return this.constructor.render({ namedParamA, queryParamA })
  }

  static get category() {
    return 'other'
  }

  static get defaultBadgeData() {
    return { label: 'cat', namedLogo: 'appveyor' }
  }

  static get examples() {
    return [
      {
        pattern: ':world',
        namedParams: { world: 'World' },
        staticPreview: this.render({ namedParamA: 'foo', queryParamA: 'bar' }),
        keywords: ['hello'],
      },
      {
        namedParams: { namedParamA: 'World' },
        staticPreview: this.render({ namedParamA: 'foo', queryParamA: 'bar' }),
        keywords: ['hello'],
      },
      {
        pattern: ':world',
        namedParams: { world: 'World' },
        queryParams: { queryParamA: '!!!' },
        staticPreview: this.render({ namedParamA: 'foo', queryParamA: 'bar' }),
        keywords: ['hello'],
      },
    ]
  }

  static get route() {
    return {
      base: 'foo',
      pattern: ':namedParamA',
      queryParams: ['queryParamA'],
    }
  }
}

describe('BaseService', function() {
  const defaultConfig = { handleInternalErrors: false }

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

  describe('Required overrides', function() {
    it('Should throw if render() is not overridden', function() {
      expect(() => BaseService.render()).to.throw(
        'render() function not implemented for BaseService'
      )
    })

    it('Should throw if handle() is not overridden', async function() {
      try {
        await BaseService.invoke({}, {}, {})
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e.message).to.equal('Handler not implemented for BaseService')
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
        'Query params',
        { queryParamA: '!' }
      )
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

    context('handle() returns invalid data', function() {
      it('Throws a validation error', async function() {
        class ThrowingService extends DummyService {
          async handle() {
            return {
              some: 'nonsense',
            }
          }
        }
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
    const expectedRouteRegex = /^\/foo\/([^/]+?)\.(svg|png|gif|jpg|json)$/

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
      const { handler: requestHandler } = mockHandleRequest.getCall(0).args[1]

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
          queryParams: [],
        },
      })

      const [first, second, third] = examples
      expect(first).to.deep.equal({
        title: 'DummyService',
        example: {
          pattern: '/foo/:world',
          namedParams: { world: 'World' },
          queryParams: {},
        },
        preview: {
          label: 'cat',
          message: 'Hello namedParamA: foo with queryParamA: bar',
          color: 'lightgrey',
          namedLogo: undefined,
          style: undefined,
        },
        keywords: ['hello'],
        documentation: undefined,
      })
      expect(second).to.deep.equal({
        title: 'DummyService',
        example: {
          pattern: '/foo/:namedParamA',
          namedParams: { namedParamA: 'World' },
          queryParams: {},
        },
        preview: {
          label: 'cat',
          message: 'Hello namedParamA: foo with queryParamA: bar',
          color: 'lightgrey',
          namedLogo: undefined,
          style: undefined,
        },
        keywords: ['hello'],
        documentation: undefined,
      })
      expect(third).to.deep.equal({
        title: 'DummyService',
        example: {
          pattern: '/foo/:world',
          namedParams: { world: 'World' },
          queryParams: { queryParamA: '!!!' },
        },
        preview: {
          color: 'lightgrey',
          label: 'cat',
          message: 'Hello namedParamA: foo with queryParamA: bar',
          namedLogo: undefined,
          style: undefined,
        },
        keywords: ['hello'],
        documentation: undefined,
      })
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

    it('throws error for invalid query params', async function() {
      try {
        DummyService._validateQueryParams(
          { requiredString: ['this', "shouldn't", 'work'] },
          dummySchema
        )
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e).to.be.an.instanceof(InvalidParameter)
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
})
