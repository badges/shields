'use strict'

const Joi = require('joi')
const { expect } = require('chai')
const { test, given, forCases } = require('sazerac')
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

require('../lib/register-chai-plugins.spec')

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
    return 'cat'
  }

  static get examples() {
    return [
      { previewUrl: 'World' },
      { previewUrl: 'World', query: { queryParamA: '!!!' } },
      {
        urlPattern: ':world',
        exampleUrl: 'World',
        staticExample: this.render({ namedParamA: 'foo', queryParamA: 'bar' }),
        keywords: ['hello'],
      },
      {
        pattern: ':world',
        exampleUrl: 'World',
        staticExample: this.render({ namedParamA: 'foo', queryParamA: 'bar' }),
        keywords: ['hello'],
      },
      {
        pattern: ':world',
        namedParams: { world: 'World' },
        staticExample: this.render({ namedParamA: 'foo', queryParamA: 'bar' }),
        keywords: ['hello'],
      },
      {
        pattern: ':world',
        namedParams: { world: 'World' },
        query: { queryParamA: '!!!' },
        staticExample: this.render({ namedParamA: 'foo', queryParamA: 'bar' }),
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

  describe('URL pattern matching', function() {
    context('A `pattern` with a named param is declared', function() {
      const regexExec = str => DummyService._regex.exec(str)
      const getNamedParamA = str => {
        const [, namedParamA] = regexExec(str)
        return namedParamA
      }
      const namedParams = str => {
        const match = regexExec(str)
        return DummyService._namedParamsForMatch(match)
      }

      test(regexExec, () => {
        forCases([
          given('/foo/bar.bar.bar.zip'),
          given('/foo/bar/bar.svg'),
          // This is a valid example with the wrong extension separator, to
          // test that we only accept a `.`.
          given('/foo/bar.bar.bar_svg'),
        ]).expect(null)
      })

      test(getNamedParamA, () => {
        forCases([
          given('/foo/bar.bar.bar.svg'),
          given('/foo/bar.bar.bar.png'),
          given('/foo/bar.bar.bar.gif'),
          given('/foo/bar.bar.bar.jpg'),
          given('/foo/bar.bar.bar.json'),
        ]).expect('bar.bar.bar')
      })

      test(namedParams, () => {
        forCases([
          given('/foo/bar.bar.bar.svg'),
          given('/foo/bar.bar.bar.png'),
          given('/foo/bar.bar.bar.gif'),
          given('/foo/bar.bar.bar.jpg'),
          given('/foo/bar.bar.bar.json'),
        ]).expect({ namedParamA: 'bar.bar.bar' })
      })
    })

    context('A `format` with a named param is declared', function() {
      class ServiceWithFormat extends BaseService {
        static get route() {
          return {
            base: 'foo',
            format: '([^/]+)',
            capture: ['namedParamA'],
          }
        }
      }

      const regexExec = str => ServiceWithFormat._regex.exec(str)
      const getNamedParamA = str => {
        const [, namedParamA] = regexExec(str)
        return namedParamA
      }
      const namedParams = str => {
        const match = regexExec(str)
        return ServiceWithFormat._namedParamsForMatch(match)
      }

      test(regexExec, () => {
        forCases([
          given('/foo/bar.bar.bar.zip'),
          given('/foo/bar/bar.svg'),
          // This is a valid example with the wrong extension separator, to
          // test that we only accept a `.`.
          given('/foo/bar.bar.bar_svg'),
        ]).expect(null)
      })

      test(getNamedParamA, () => {
        forCases([
          given('/foo/bar.bar.bar.svg'),
          given('/foo/bar.bar.bar.png'),
          given('/foo/bar.bar.bar.gif'),
          given('/foo/bar.bar.bar.jpg'),
          given('/foo/bar.bar.bar.json'),
        ]).expect('bar.bar.bar')
      })

      test(namedParams, () => {
        forCases([
          given('/foo/bar.bar.bar.svg'),
          given('/foo/bar.bar.bar.png'),
          given('/foo/bar.bar.bar.gif'),
          given('/foo/bar.bar.bar.jpg'),
          given('/foo/bar.bar.bar.json'),
        ]).expect({ namedParamA: 'bar.bar.bar' })
      })
    })

    context('No named params are declared', function() {
      class ServiceWithZeroNamedParams extends BaseService {
        static get route() {
          return {
            base: 'foo',
            format: '(?:[^/]+)',
          }
        }
      }

      const namedParams = str => {
        const match = ServiceWithZeroNamedParams._regex.exec(str)
        return ServiceWithZeroNamedParams._namedParamsForMatch(match)
      }

      test(namedParams, () => {
        forCases([
          given('/foo/bar.bar.bar.svg'),
          given('/foo/bar.bar.bar.png'),
          given('/foo/bar.bar.bar.gif'),
          given('/foo/bar.bar.bar.jpg'),
          given('/foo/bar.bar.bar.json'),
        ]).expect({})
      })
    })
  })

  it('Invokes the handler as expected', async function() {
    const serviceInstance = new DummyService({}, defaultConfig)
    const serviceData = await serviceInstance.invokeHandler(
      { namedParamA: 'bar.bar.bar' },
      { queryParamA: '!' }
    )
    expect(serviceData).to.deep.equal({
      message: 'Hello namedParamA: bar.bar.bar with queryParamA: !',
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
      const serviceInstance = new DummyService({}, defaultConfig)
      await serviceInstance.invokeHandler(
        {
          namedParamA: 'bar.bar.bar',
        },
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
        {
          namedParamA: 'bar.bar.bar',
        }
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
      const serviceInstance = new DummyService(
        {},
        { handleInternalErrors: true }
      )
      serviceInstance.handle = () => {
        throw Error("I've made a huge mistake")
      }
      expect(
        await serviceInstance.invokeHandler({
          namedParamA: 'bar.bar.bar',
        })
      ).to.deep.equal({
        color: 'lightgray',
        label: 'shields',
        message: 'internal error',
      })
    })

    describe('Handles known subtypes of ShieldsInternalError', function() {
      let serviceInstance
      beforeEach(function() {
        serviceInstance = new DummyService({}, {})
      })

      it('handles NotFound errors', async function() {
        serviceInstance.handle = () => {
          throw new NotFound()
        }
        expect(
          await serviceInstance.invokeHandler({
            namedParamA: 'bar.bar.bar',
          })
        ).to.deep.equal({
          color: 'red',
          message: 'not found',
        })
      })

      it('handles Inaccessible errors', async function() {
        serviceInstance.handle = () => {
          throw new Inaccessible()
        }
        expect(
          await serviceInstance.invokeHandler({
            namedParamA: 'bar.bar.bar',
          })
        ).to.deep.equal({
          color: 'lightgray',
          message: 'inaccessible',
        })
      })

      it('handles InvalidResponse errors', async function() {
        serviceInstance.handle = () => {
          throw new InvalidResponse()
        }
        expect(
          await serviceInstance.invokeHandler({
            namedParamA: 'bar.bar.bar',
          })
        ).to.deep.equal({
          color: 'lightgray',
          message: 'invalid',
        })
      })

      it('handles Deprecated', async function() {
        serviceInstance.handle = () => {
          throw new Deprecated()
        }
        expect(
          await serviceInstance.invokeHandler({
            namedParamA: 'bar.bar.bar',
          })
        ).to.deep.equal({
          color: 'lightgray',
          message: 'no longer available',
        })
      })

      it('handles InvalidParameter errors', async function() {
        serviceInstance.handle = () => {
          throw new InvalidParameter()
        }
        expect(
          await serviceInstance.invokeHandler({
            namedParamA: 'bar.bar.bar',
          })
        ).to.deep.equal({
          color: 'red',
          message: 'invalid parameter',
        })
      })
    })
  })

  describe('_makeBadgeData', function() {
    describe('Overrides', function() {
      it('overrides the label', function() {
        const badgeData = DummyService._makeBadgeData(
          { label: 'purr count' },
          { label: 'purrs' }
        )
        expect(badgeData.text).to.deep.equal(['purr count', 'n/a'])
      })

      it('overrides the color', function() {
        const badgeData = DummyService._makeBadgeData(
          { colorB: '10ADED' },
          { color: 'red' }
        )
        expect(badgeData.colorB).to.equal('#10ADED')
      })
    })

    describe('Service data', function() {
      it('applies the service message', function() {
        const badgeData = DummyService._makeBadgeData({}, { message: '10k' })
        expect(badgeData.text).to.deep.equal(['cat', '10k'])
      })

      it('preserves an empty label', function() {
        const badgeData = DummyService._makeBadgeData(
          {},
          { label: '', message: '10k' }
        )
        expect(badgeData.text).to.deep.equal(['', '10k'])
      })

      it('applies a numeric service message', function() {
        // While a number of badges use this, in the long run we may want
        // `render()` to always return a string.
        const badgeData = DummyService._makeBadgeData({}, { message: 10 })
        expect(badgeData.text).to.deep.equal(['cat', 10])
      })

      it('applies the service color', function() {
        const badgeData = DummyService._makeBadgeData({}, { color: 'red' })
        expect(badgeData.colorscheme).to.equal('red')
      })
    })

    describe('Defaults', function() {
      it('uses the default label', function() {
        const badgeData = DummyService._makeBadgeData({}, {})
        expect(badgeData.text).to.deep.equal(['cat', 'n/a'])
      })

      it('uses the default color', function() {
        const badgeData = DummyService._makeBadgeData({}, {})
        expect(badgeData.colorscheme).to.equal('lightgrey')
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
      const { handler: requestHandler } = mockHandleRequest.getCall(0).args[0]

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
        colorscheme: 'lightgrey',
        template: undefined,
        logo: undefined,
        logoWidth: NaN,
        links: [],
        colorA: undefined,
      })
    })
  })

  describe('_makeStaticExampleUrl', function() {
    test(
      serviceData => DummyService._makeStaticExampleUrl(serviceData),
      () => {
        given({
          message: 'hello',
          color: 'dcdc00',
        }).expect('/badge/cat-hello-%23dcdc00.svg')
        given({
          message: 'hello',
          color: 'red',
        }).expect('/badge/cat-hello-red.svg')
        given({
          message: 'hello',
        }).expect('/badge/cat-hello-lightgrey.svg')
      }
    )
  })

  describe('prepareExamples', function() {
    it('returns the expected result', function() {
      const [
        first,
        second,
        third,
        fourth,
        fifth,
        sixth,
      ] = DummyService.prepareExamples()
      expect(first).to.deep.equal({
        title: 'DummyService',
        exampleUrl: undefined,
        previewUrl: '/foo/World.svg',
        urlPattern: undefined,
        documentation: undefined,
        keywords: undefined,
      })
      expect(second).to.deep.equal({
        title: 'DummyService',
        exampleUrl: undefined,
        previewUrl: '/foo/World.svg?queryParamA=%21%21%21',
        urlPattern: undefined,
        documentation: undefined,
        keywords: undefined,
      })
      const preparedStaticExample = {
        title: 'DummyService',
        exampleUrl: '/foo/World.svg',
        previewUrl:
          '/badge/cat-Hello%20namedParamA%3A%20foo%20with%20queryParamA%3A%20bar-lightgrey.svg',
        urlPattern: '/foo/:world.svg',
        documentation: undefined,
        keywords: ['hello'],
      }
      expect(third).to.deep.equal(preparedStaticExample)
      expect(fourth).to.deep.equal(preparedStaticExample)
      expect(fifth).to.deep.equal(preparedStaticExample)
      expect(sixth).to.deep.equal({
        title: 'DummyService',
        exampleUrl: '/foo/World.svg?queryParamA=%21%21%21',
        previewUrl:
          '/badge/cat-Hello%20namedParamA%3A%20foo%20with%20queryParamA%3A%20bar-lightgrey.svg',
        urlPattern: '/foo/:world.svg?queryParamA=%21%21%21',
        documentation: undefined,
        keywords: ['hello'],
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
