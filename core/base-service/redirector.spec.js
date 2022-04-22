import { expect } from 'chai'
import { ExpressTestHarness } from '../express-test-harness.js'
import redirector from './redirector.js'

describe('Redirector', function () {
  const route = {
    base: 'very/old/service',
    pattern: ':namedParamA',
  }
  const category = 'analysis'
  const transformPath = () => {}
  const dateAdded = new Date()
  const attrs = { category, route, transformPath, dateAdded }

  it('returns true on isDeprecated', function () {
    expect(redirector(attrs).isDeprecated).to.be.true
  })

  it('has the expected name', function () {
    expect(redirector(attrs).name).to.equal('VeryOldServiceRedirect')
  })

  it('overrides the name', function () {
    expect(
      redirector({
        ...attrs,
        name: 'ShinyRedirect',
      }).name
    ).to.equal('ShinyRedirect')
  })

  it('sets specified route', function () {
    expect(redirector(attrs).route).to.deep.equal(route)
  })

  it('sets specified category', function () {
    expect(redirector(attrs).category).to.equal(category)
  })

  it('throws the expected error when dateAdded is missing', function () {
    expect(() =>
      redirector({ route, category, transformPath }).validateDefinition()
    ).to.throw('"dateAdded" is required')
  })

  it('sets specified example', function () {
    const examples = [
      {
        title: 'very old service',
        pattern: ':namedParamA',
        namedParams: {
          namedParamA: 'namedParamAValue',
        },
        staticPreview: {
          label: 'service',
          message: 'v0.14.0',
          color: 'blue',
        },
      },
    ]
    expect(redirector({ ...attrs, examples }).examples).to.equal(examples)
  })

  describe('Express integration', function () {
    const transformPath = ({ namedParamA }) => `/new/service/${namedParamA}`

    let harness
    beforeEach(async function () {
      harness = new ExpressTestHarness()
      const ServiceClass = redirector({
        category,
        route,
        transformPath,
        dateAdded,
      })
      ServiceClass.register(
        { app: harness.app },
        { rasterUrl: 'http://raster.example.test' }
      )
      await harness.start()
    })

    afterEach(async function () {
      await harness.stop()
    })

    it('should redirect as configured', async function () {
      const { statusCode, headers } = await harness.get(
        '/very/old/service/hello-world.svg',
        { followRedirect: false }
      )

      expect(statusCode).to.equal(301)
      expect(headers.location).to.equal('/new/service/hello-world.svg')
    })

    it('should redirect raster extensions to the canonical path as configured', async function () {
      const { statusCode, headers } = await harness.get(
        '/very/old/service/hello-world.png',
        { followRedirect: false }
      )

      expect(statusCode).to.equal(301)
      expect(headers.location).to.equal(
        'http://raster.example.test/new/service/hello-world.png'
      )
    })

    it('should forward the query params', async function () {
      const { statusCode, headers } = await harness.get(
        '/very/old/service/hello-world.svg?color=123&style=flat-square',
        { followRedirect: false }
      )

      expect(statusCode).to.equal(301)
      expect(headers.location).to.equal(
        '/new/service/hello-world.svg?color=123&style=flat-square'
      )
    })

    it('should correctly encode the redirect URL', async function () {
      const { statusCode, headers } = await harness.get(
        '/very/old/service/hello%0Dworld.svg?foobar=a%0Db',
        { followRedirect: false }
      )

      expect(statusCode).to.equal(301)
      expect(headers.location).to.equal(
        '/new/service/hello%0Dworld.svg?foobar=a%0Db'
      )
    })

    describe('transformQueryParams', function () {
      const route = {
        base: 'another/old/service',
        pattern: 'token/:token/:namedParamA',
      }
      const transformQueryParams = ({ token }) => ({ token })

      beforeEach(function () {
        const ServiceClass = redirector({
          category,
          route,
          transformPath,
          transformQueryParams,
          dateAdded,
        })
        ServiceClass.register({ app: harness.app }, {})
      })

      it('should forward the transformed query params', async function () {
        const { statusCode, headers } = await harness.get(
          '/another/old/service/token/abc123/hello-world.svg',
          { followRedirect: false }
        )

        expect(statusCode).to.equal(301)
        expect(headers.location).to.equal(
          '/new/service/hello-world.svg?token=abc123'
        )
      })

      it('should forward the specified and transformed query params', async function () {
        const { statusCode, headers } = await harness.get(
          '/another/old/service/token/abc123/hello-world.svg?color=123&style=flat-square',
          { followRedirect: false }
        )

        expect(statusCode).to.equal(301)
        expect(headers.location).to.equal(
          '/new/service/hello-world.svg?color=123&style=flat-square&token=abc123'
        )
      })

      it('should use transformed query params on param conflicts by default', async function () {
        const { statusCode, headers } = await harness.get(
          '/another/old/service/token/abc123/hello-world.svg?color=123&style=flat-square&token=def456',
          { followRedirect: false }
        )

        expect(statusCode).to.equal(301)
        expect(headers.location).to.equal(
          '/new/service/hello-world.svg?color=123&style=flat-square&token=abc123'
        )
      })

      it('should use specified query params on param conflicts when configured', async function () {
        const route = {
          base: 'override/service',
          pattern: 'token/:token/:namedParamA',
        }
        const ServiceClass = redirector({
          category,
          route,
          transformPath,
          transformQueryParams,
          overrideTransformedQueryParams: true,
          dateAdded,
        })
        ServiceClass.register({ app: harness.app }, {})
        const { statusCode, headers } = await harness.get(
          '/override/service/token/abc123/hello-world.svg?style=flat-square&token=def456',
          { followRedirect: false }
        )

        expect(statusCode).to.equal(301)
        expect(headers.location).to.equal(
          '/new/service/hello-world.svg?style=flat-square&token=def456'
        )
      })
    })
  })
})
