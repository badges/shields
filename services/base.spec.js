'use strict'

const { expect } = require('chai')
const { test, given, forCases } = require('sazerac')
const sinon = require('sinon')

const {
  NotFound,
  Inaccessible,
  InvalidResponse,
  InvalidParameter,
} = require('./errors')
const BaseService = require('./base')

require('../lib/register-chai-plugins.spec')

class DummyService extends BaseService {
  async handle({ namedParamA }, { queryParamA }) {
    return { message: `Hello ${namedParamA}${queryParamA}` }
  }

  static get category() {
    return 'cat'
  }
  static get examples() {
    return [
      { previewUrl: 'World' },
      { previewUrl: 'World', query: { queryParamA: '!!!' } },
    ]
  }
  static get url() {
    return {
      base: 'foo',
      format: '([^/]+)',
      capture: ['namedParamA'],
      queryParams: ['queryParamA'],
    }
  }
}

describe('BaseService', function() {
  const defaultConfig = { handleInternalErrors: false }

  describe('URL pattern matching', function() {
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

  it('Invokes the handler as expected', async function() {
    const serviceInstance = new DummyService({}, defaultConfig)
    const serviceData = await serviceInstance.invokeHandler(
      { namedParamA: 'bar.bar.bar' },
      { queryParamA: '!' }
    )
    expect(serviceData).to.deep.equal({ message: 'Hello bar.bar.bar!' })
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
      sinon.stub(DummyService, 'logTrace')
    })
    it('Invokes the logger as expected', async function() {
      const serviceInstance = new DummyService({}, defaultConfig)
      await serviceInstance.invokeHandler(
        {
          namedParamA: 'bar.bar.bar',
        },
        { queryParamA: '!' }
      )
      expect(DummyService.logTrace).to.be.calledWithMatch(
        'inbound',
        sinon.match.string,
        'Service class',
        'DummyService'
      )
      expect(DummyService.logTrace).to.be.calledWith(
        'inbound',
        sinon.match.string,
        'Named params',
        {
          namedParamA: 'bar.bar.bar',
        }
      )
      expect(DummyService.logTrace).to.be.calledWith(
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
    const expectedRouteRegex = /^\/foo\/([^/]+).(svg|png|gif|jpg|json)$/

    let mockCamp
    let mockHandleRequest

    beforeEach(function() {
      mockCamp = {
        route: sinon.spy(),
      }
      mockHandleRequest = sinon.spy()
      DummyService.register(mockCamp, mockHandleRequest, defaultConfig)
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
        text: ['cat', 'Hello bar?'],
        colorscheme: 'lightgrey',
        template: undefined,
        logo: undefined,
        logoWidth: NaN,
        links: [],
        colorA: undefined,
      })
    })
  })

  describe('prepareExamples', function() {
    it('returns the expected result', function() {
      const [first, second] = DummyService.prepareExamples()
      expect(first).to.deep.equal({
        title: 'DummyService',
        previewUri: '/foo/World.svg',
        exampleUri: undefined,
        documentation: undefined,
      })
      expect(second).to.deep.equal({
        title: 'DummyService',
        previewUri: '/foo/World.svg?queryParamA=%21%21%21',
        exampleUri: undefined,
        documentation: undefined,
      })
    })
  })
})
