'use strict'

const Camp = require('camp')
const got = require('got')
const portfinder = require('portfinder')
const { expect } = require('chai')
const redirector = require('./redirector')

describe('Redirector', function() {
  const route = {
    base: 'very/old/service',
    pattern: ':namedParamA',
  }
  const category = 'analysis'
  const target = () => {}
  const attrs = {
    category,
    route,
    target,
    dateAdded: new Date(),
  }

  it('returns true on isDeprecated', function() {
    expect(redirector(attrs).isDeprecated).to.be.true
  })

  it('sets specified route', function() {
    expect(redirector(attrs).route).to.deep.equal(route)
  })

  it('sets specified category', function() {
    expect(redirector(attrs).category).to.equal(category)
  })

  it('throws the expected error when dateAdded is missing', function() {
    expect(() =>
      redirector({ route, category, target }).validateDefinition()
    ).to.throw('"dateAdded" is required')
  })

  describe('ScoutCamp integration', function() {
    let port, baseUrl
    beforeEach(async function() {
      port = await portfinder.getPortPromise()
      baseUrl = `http://127.0.0.1:${port}`
    })

    let camp
    beforeEach(async function() {
      camp = Camp.start({ port, hostname: '::' })
      await new Promise(resolve => camp.on('listening', () => resolve()))
    })
    afterEach(async function() {
      if (camp) {
        await new Promise(resolve => camp.close(resolve))
        camp = undefined
      }
    })

    const target = ({ namedParamA }) => `/new/service/${namedParamA}`

    beforeEach(function() {
      const ServiceClass = redirector({ route, target })
      ServiceClass.register({ camp })
    })

    it('should redirect as configured', async function() {
      const { statusCode, headers } = await got(
        `${baseUrl}/very/old/service/hello-world.svg`,
        {
          followRedirect: false,
        }
      )

      expect(statusCode).to.equal(301)
      expect(headers.location).to.equal('/new/service/hello-world.svg')
    })

    it('should preserve the extension', async function() {
      const { statusCode, headers } = await got(
        `${baseUrl}/very/old/service/hello-world.png`,
        {
          followRedirect: false,
        }
      )

      expect(statusCode).to.equal(301)
      expect(headers.location).to.equal('/new/service/hello-world.png')
    })

    it('should forward the query params', async function() {
      const { statusCode, headers } = await got(
        `${baseUrl}/very/old/service/hello-world.svg?color=123&style=flat-square`,
        {
          followRedirect: false,
        }
      )

      expect(statusCode).to.equal(301)
      expect(headers.location).to.equal(
        '/new/service/hello-world.svg?color=123&style=flat-square'
      )
    })
  })
})
