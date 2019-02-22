'use strict'

const fs = require('fs')
const path = require('path')
const { expect } = require('chai')
const fetch = require('node-fetch')
const got = require('got')
const isPng = require('is-png')
const isSvg = require('is-svg')
const sinon = require('sinon')
const portfinder = require('portfinder')
const Joi = require('joi')
const svg2img = require('../../gh-badges/lib/svg-to-img')
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
    const res = await fetch(`${baseUrl}:fruit-apple-green.svg`)
    expect(res.ok).to.be.true
    expect(await res.text())
      .to.satisfy(isSvg)
      .and.to.include('fruit')
      .and.to.include('apple')
  })

  it('should produce colorscheme PNG badges', async function() {
    const res = await fetch(`${baseUrl}:fruit-apple-green.png`)
    expect(res.ok).to.be.true
    expect(await res.buffer()).to.satisfy(isPng)
  })

  it('should preserve label case', async function() {
    const res = await fetch(`${baseUrl}:fRuiT-apple-green.svg`)
    expect(res.ok).to.be.true
    expect(await res.text())
      .to.satisfy(isSvg)
      .and.to.include('fRuiT')
  })

  // https://github.com/badges/shields/pull/1319
  it('should not crash with a numeric logo', async function() {
    const res = await fetch(`${baseUrl}:fruit-apple-green.svg?logo=1`)
    expect(res.ok).to.be.true
    expect(await res.text())
      .to.satisfy(isSvg)
      .and.to.include('fruit')
      .and.to.include('apple')
  })

  it('should not crash with a numeric link', async function() {
    const res = await fetch(`${baseUrl}:fruit-apple-green.svg?link=1`)
    expect(res.ok).to.be.true
    expect(await res.text())
      .to.satisfy(isSvg)
      .and.to.include('fruit')
      .and.to.include('apple')
  })

  it('should not crash with a boolean link', async function() {
    const res = await fetch(`${baseUrl}:fruit-apple-green.svg?link=true`)
    expect(res.ok).to.be.true
    expect(await res.text())
      .to.satisfy(isSvg)
      .and.to.include('fruit')
      .and.to.include('apple')
  })

  it('should return the 404 badge for unknown badges', async function() {
    const res = await fetch(`${baseUrl}this/is/not/a/badge.svg`)
    expect(res.status).to.equal(404)
    expect(await res.text())
      .to.satisfy(isSvg)
      .and.to.include('404')
      .and.to.include('badge not found')
  })

  it('should return the 404 html page for rando links', async function() {
    const res = await fetch(`${baseUrl}this/is/most/definitely/not/a/badge.js`)
    expect(res.status).to.equal(404)
    expect(await res.text()).to.include('blood, toil, tears and sweat')
  })

  it('should redirect the root as configured', async function() {
    const res = await got(baseUrl, { followRedirect: false })

    expect(res.statusCode).to.equal(302)
    // This value is set in `config/test.yml`
    expect(res.headers.location).to.equal('http://badge-server.example.com')
  })

  context('with svg2img error', function() {
    const expectedError = fs.readFileSync(
      path.resolve(__dirname, 'error-pages', '500.html')
    )

    let toBufferStub
    beforeEach(function() {
      toBufferStub = sinon
        .stub(svg2img._imageMagick.prototype, 'toBuffer')
        .callsArgWith(1, Error('whoops'))
    })
    afterEach(function() {
      toBufferStub.restore()
    })

    it('should emit the 500 message', async function() {
      const res = await fetch(`${baseUrl}:some_new-badge-green.png`)
      // This emits status code 200, though 500 would be preferable.
      expect(res.status).to.equal(200)
      expect(await res.text()).to.include(expectedError)
    })
  })

  describe('analytics endpoint', function() {
    it('should return analytics in the expected format', async function() {
      const countSchema = Joi.array()
        .items(
          Joi.number()
            .integer()
            .min(0)
            .required()
        )
        .length(36)
        .required()
      const analyticsSchema = Joi.object({
        vendorMonthly: countSchema,
        rawMonthly: countSchema,
        vendorFlatMonthly: countSchema,
        rawFlatMonthly: countSchema,
        vendorFlatSquareMonthly: countSchema,
        rawFlatSquareMonthly: countSchema,
      }).required()

      const res = await fetch(`${baseUrl}$analytics/v1`)
      expect(res.ok).to.be.true

      const json = await res.json()

      Joi.assert(json, analyticsSchema)
    })
  })
})
