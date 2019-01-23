'use strict'

const Joi = require('joi')
const { expect } = require('chai')
const { test, given, forCases } = require('sazerac')
const sinon = require('sinon')
const { getShieldsIcon } = require('../../lib/logos')
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
      { previewUrl: 'World' },
      { previewUrl: 'World', queryParams: { queryParamA: '!!!' } },
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

  describe('_makeBadgeData', function() {
    describe('Overrides', function() {
      it('overrides the label', function() {
        const badgeData = DummyService._makeBadgeData(
          { label: 'purr count' },
          { label: 'purrs' }
        )
        expect(badgeData.text).to.deep.equal(['purr count', 'n/a'])
      })

      it('overrides the label color', function() {
        const badgeData = DummyService._makeBadgeData(
          { colorA: '42f483' },
          { color: 'green' }
        )
        expect(badgeData.labelColor).to.equal('42f483')
      })

      it('overrides the color', function() {
        const badgeData = DummyService._makeBadgeData(
          { colorB: '10ADED' },
          { color: 'red' }
        )
        expect(badgeData.color).to.equal('10ADED')
      })

      it('converts a query-string numeric color to a string', function() {
        const badgeData = DummyService._makeBadgeData(
          // Scoutcamp converts numeric query params to numbers.
          { colorB: 123 },
          { color: 'green' }
        )
        expect(badgeData.color).to.equal('123')
      })

      it('does not override the color in case of an error', function() {
        const badgeData = DummyService._makeBadgeData(
          { colorB: '10ADED' },
          { isError: true, color: 'lightgray' }
        )
        expect(badgeData.color).to.equal('lightgray')
      })

      it('overrides the logo', function() {
        const badgeData = DummyService._makeBadgeData(
          { logo: 'github' },
          { namedLogo: 'appveyor' }
        )
        // .not.be.empty for confidence that nothing has changed with `getShieldsIcon()`.
        expect(badgeData.logo).to.equal(getShieldsIcon({ name: 'github' })).and
          .not.be.empty
      })

      it('overrides the logo with a color', function() {
        const badgeData = DummyService._makeBadgeData(
          { logo: 'github', logoColor: 'blue' },
          { namedLogo: 'appveyor' }
        )
        expect(badgeData.logo).to.equal(
          getShieldsIcon({ name: 'github', color: 'blue' })
        ).and.not.be.empty
      })

      it("when the logo is overridden, it ignores the service's logo color, position, and width", function() {
        const badgeData = DummyService._makeBadgeData(
          { logo: 'github' },
          {
            namedLogo: 'appveyor',
            logoColor: 'red',
            logoPosition: -3,
            logoWidth: 100,
          }
        )
        expect(badgeData.logo).to.equal(getShieldsIcon({ name: 'github' })).and
          .not.be.empty
      })

      it("overrides the service logo's color", function() {
        const badgeData = DummyService._makeBadgeData(
          { logoColor: 'blue' },
          { namedLogo: 'github', logoColor: 'red' }
        )
        expect(badgeData.logo).to.equal(
          getShieldsIcon({ name: 'github', color: 'blue' })
        ).and.not.be.empty
      })

      it('overrides the logo with custom svg', function() {
        const logoSvg = 'data:image/svg+xml;base64,PHN2ZyB4bWxu'
        const badgeData = DummyService._makeBadgeData(
          { logo: logoSvg },
          { namedLogo: 'appveyor' }
        )
        expect(badgeData.logo).to.equal(logoSvg)
      })

      it('ignores the color when custom svg is provided', function() {
        const logoSvg = 'data:image/svg+xml;base64,PHN2ZyB4bWxu'
        const badgeData = DummyService._makeBadgeData(
          { logo: logoSvg, logoColor: 'brightgreen' },
          { namedLogo: 'appveyor' }
        )
        expect(badgeData.logo).to.equal(logoSvg)
      })

      it('overrides the logoWidth', function() {
        const badgeData = DummyService._makeBadgeData({ logoWidth: 20 }, {})
        expect(badgeData.logoWidth).to.equal(20)
      })

      it('overrides the logoPosition', function() {
        const badgeData = DummyService._makeBadgeData({ logoPosition: -10 }, {})
        expect(badgeData.logoPosition).to.equal(-10)
      })

      it('overrides the links', function() {
        const badgeData = DummyService._makeBadgeData(
          { link: 'https://circleci.com/gh/badges/daily-tests' },
          {
            link:
              'https://circleci.com/workflow-run/184ef3de-4836-4805-a2e4-0ceba099f92d',
          }
        )
        expect(badgeData.links).to.deep.equal([
          'https://circleci.com/gh/badges/daily-tests',
        ])
      })

      it('overrides the template', function() {
        const badgeData = DummyService._makeBadgeData({ style: 'pill' }, {})
        expect(badgeData.template).to.equal('pill')
      })

      it('overrides the cache length', function() {
        const badgeData = DummyService._makeBadgeData(
          { style: 'pill' },
          { cacheSeconds: 123 }
        )
        expect(badgeData.cacheLengthSeconds).to.equal(123)
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
        expect(badgeData.color).to.equal('red')
      })

      it('applies the named logo', function() {
        const badgeData = DummyService._makeBadgeData(
          {},
          { namedLogo: 'github' }
        )
        // .not.be.empty for confidence that nothing has changed with `getShieldsIcon()`.
        expect(badgeData.logo).to.equal(getShieldsIcon({ name: 'github' })).and
          .not.to.be.empty
      })

      it('applies the named logo with color', function() {
        const badgeData = DummyService._makeBadgeData(
          {},
          { namedLogo: 'github', logoColor: 'blue' }
        )
        expect(badgeData.logo).to.equal(
          getShieldsIcon({ name: 'github', color: 'blue' })
        ).and.not.to.be.empty
      })

      it('applies the logo width', function() {
        const badgeData = DummyService._makeBadgeData(
          {},
          { namedLogo: 'github', logoWidth: 275 }
        )
        expect(badgeData.logoWidth).to.equal(275)
      })

      it('applies the logo position', function() {
        const badgeData = DummyService._makeBadgeData(
          {},
          { namedLogo: 'github', logoPosition: -10 }
        )
        expect(badgeData.logoPosition).to.equal(-10)
      })

      it('applies the service label color', function() {
        const badgeData = DummyService._makeBadgeData({}, { labelColor: 'red' })
        expect(badgeData.labelColor).to.equal('red')
      })
    })

    describe('Defaults', function() {
      it('uses the default label', function() {
        const badgeData = DummyService._makeBadgeData({}, {})
        expect(badgeData.text).to.deep.equal(['cat', 'n/a'])
      })

      it('uses the default color', function() {
        const badgeData = DummyService._makeBadgeData({}, {})
        expect(badgeData.color).to.equal('lightgrey')
      })

      it('provides no default label color', function() {
        const badgeData = DummyService._makeBadgeData({}, {})
        expect(badgeData.labelColor).to.be.undefined
      })

      it('when not a social badge, ignores the default named logo', function() {
        const badgeData = DummyService._makeBadgeData({}, {})
        expect(badgeData.logo).to.be.undefined
      })

      it('when a social badge, uses the default named logo', function() {
        const badgeData = DummyService._makeBadgeData({ style: 'social' }, {})
        expect(badgeData.logo).to.equal(getShieldsIcon({ name: 'appveyor' }))
          .and.not.be.empty
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

      const [first, second, third, fourth, fifth] = examples
      expect(first).to.deep.equal({
        title: 'DummyService',
        example: {
          path: '/foo/World',
          queryParams: {},
        },
        preview: {
          path: '/foo/World',
          queryParams: {},
        },
        keywords: [],
        documentation: undefined,
      })
      expect(second).to.deep.equal({
        title: 'DummyService',
        example: {
          path: '/foo/World',
          queryParams: { queryParamA: '!!!' },
        },
        preview: {
          path: '/foo/World',
          queryParams: { queryParamA: '!!!' },
        },
        keywords: [],
        documentation: undefined,
      })
      expect(third).to.deep.equal({
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
        },
        keywords: ['hello'],
        documentation: undefined,
      })
      expect(fourth).to.deep.equal({
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
        },
        keywords: ['hello'],
        documentation: undefined,
      })
      expect(fifth).to.deep.equal({
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
