'use strict'

const { expect } = require('chai')
const isSvg = require('is-svg')
const portfinder = require('portfinder')
const got = require('../got-test-client')
const { createTestServer } = require('./in-process-server-test-helpers')

describe('The server', function() {
  let server, baseUrl
  before('Start the server', async function() {
    // Fixes https://github.com/badges/shields/issues/2611
    this.timeout(10000)
    const port = await portfinder.getPortPromise()
    server = createTestServer({ port })
    baseUrl = server.baseUrl
    await server.start()
  })
  after('Shut down the server', async function() {
    if (server) {
      await server.stop()
    }
    server = undefined
  })

  it('should produce colorscheme badges', async function() {
    const { statusCode, body } = await got(`${baseUrl}:fruit-apple-green.svg`)
    expect(statusCode).to.equal(200)
    expect(body)
      .to.satisfy(isSvg)
      .and.to.include('fruit')
      .and.to.include('apple')
  })

  it('should redirect colorscheme PNG badges as configured', async function() {
    const { statusCode, headers } = await got(
      `${baseUrl}:fruit-apple-green.png`,
      {
        followRedirect: false,
      }
    )
    expect(statusCode).to.equal(301)
    expect(headers.location).to.equal(
      'http://raster.example.test/:fruit-apple-green.png'
    )
  })

  it('should redirect modern PNG badges as configured', async function() {
    const { statusCode, headers } = await got(`${baseUrl}npm/v/express.png`, {
      followRedirect: false,
    })
    expect(statusCode).to.equal(301)
    expect(headers.location).to.equal(
      'http://raster.example.test/npm/v/express.png'
    )
  })

  it('should produce json badges', async function() {
    const { statusCode, body, headers } = await got(
      `${baseUrl}npm/v/express.json`
    )
    expect(statusCode).to.equal(200)
    expect(headers['content-type']).to.equal('application/json')
    expect(() => JSON.parse(body)).not.to.throw()
  })

  it('should preserve label case', async function() {
    const { statusCode, body } = await got(`${baseUrl}:fRuiT-apple-green.svg`)
    expect(statusCode).to.equal(200)
    expect(body)
      .to.satisfy(isSvg)
      .and.to.include('fRuiT')
  })

  // https://github.com/badges/shields/pull/1319
  it('should not crash with a numeric logo', async function() {
    const { statusCode, body } = await got(
      `${baseUrl}:fruit-apple-green.svg?logo=1`
    )
    expect(statusCode).to.equal(200)
    expect(body)
      .to.satisfy(isSvg)
      .and.to.include('fruit')
      .and.to.include('apple')
  })

  it('should not crash with a numeric link', async function() {
    const { statusCode, body } = await got(
      `${baseUrl}:fruit-apple-green.svg?link=1`
    )
    expect(statusCode).to.equal(200)
    expect(body)
      .to.satisfy(isSvg)
      .and.to.include('fruit')
      .and.to.include('apple')
  })

  it('should not crash with a boolean link', async function() {
    const { statusCode, body } = await got(
      `${baseUrl}:fruit-apple-green.svg?link=true`
    )
    expect(statusCode).to.equal(200)
    expect(body)
      .to.satisfy(isSvg)
      .and.to.include('fruit')
      .and.to.include('apple')
  })

  it('should return the 404 badge for unknown badges', async function() {
    const { statusCode, body } = await got(
      `${baseUrl}this/is/not/a/badge.svg`,
      { throwHttpErrors: false }
    )
    expect(statusCode).to.equal(404)
    expect(body)
      .to.satisfy(isSvg)
      .and.to.include('404')
      .and.to.include('badge not found')
  })

  it('should return the 404 badge page for rando links', async function() {
    const { statusCode, body } = await got(
      `${baseUrl}this/is/most/definitely/not/a/badge.js`,
      { throwHttpErrors: false }
    )
    expect(statusCode).to.equal(404)
    expect(body)
      .to.satisfy(isSvg)
      .and.to.include('404')
      .and.to.include('badge not found')
  })

  it('should redirect the root as configured', async function() {
    const { statusCode, headers } = await got(baseUrl, {
      followRedirect: false,
    })

    expect(statusCode).to.equal(302)
    // This value is set in `config/test.yml`
    expect(headers.location).to.equal('http://frontend.example.test')
  })

  it('should return the 410 badge for obsolete formats', async function() {
    const { statusCode, body } = await got(`${baseUrl}npm/v/express.jpg`, {
      throwHttpErrors: false,
    })
    // TODO It would be nice if this were 404 or 410.
    expect(statusCode).to.equal(200)
    expect(body)
      .to.satisfy(isSvg)
      .and.to.include('410')
      .and.to.include('jpg no longer available')
  })

  it('should return cors header for the request', async function() {
    const { statusCode, headers } = await got(`${baseUrl}npm/v/express.svg`)
    expect(statusCode).to.equal(200)
    expect(headers['access-control-allow-origin']).to.equal('*')
  })
})
