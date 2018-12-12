'use strict'

const { expect } = require('chai')
const fetch = require('node-fetch')
const fs = require('fs')
const isPng = require('is-png')
const isSvg = require('is-svg')
const path = require('path')
const sinon = require('sinon')
const Camp = require('camp')
const portfinder = require('portfinder')
const svg2img = require('../gh-badges/lib/svg-to-img')
const { loadServiceClasses } = require('../services')
const { createTestServer } = require('./in-process-server-test-helpers')
const { handleRequest } = require('./request-handler')
const serverConfig = require('./server-config')

describe('The server', function() {
  let dummyCamp
  before(async function() {
    const port = await portfinder.getPortPromise()
    dummyCamp = Camp.start({ port, hostname: '::' })
    await new Promise(resolve => dummyCamp.on('listening', () => resolve()))
  })
  before('Check the services', function() {
    // The responsibility of this `before()` hook is to verify that the server
    // will be able to register all the services. When it fails, the balance of
    // this `describe()` block – that is, the server tests – does not run.
    //
    // Without this block, the next `before()` hook fails while printing this
    // quite opaque message:
    //
    // Error: listen EADDRINUSE :::1111
    //   at Object._errnoException (util.js:1022:11)
    //   at _exceptionWithHostPort (util.js:1044:20)
    //   at Camp.setupListenHandle [as _listen2] (net.js:1367:14)
    //   at listenInCluster (net.js:1408:12)
    //   at doListen (net.js:1517:7)
    //   at _combinedTickCallback (internal/process/next_tick.js:141:11)
    //   at process._tickDomainCallback (internal/process/next_tick.js:218:9)
    loadServiceClasses().forEach(serviceClass =>
      serviceClass.register({ camp: dummyCamp, handleRequest }, serverConfig)
    )
  })
  after(async function() {
    // Free up the port and shut down the server immediately, even when the
    // `before()` block fails during registration.
    if (dummyCamp) {
      await new Promise(resolve => dummyCamp.close(resolve))
      dummyCamp = undefined
    }
  })

  let server, baseUrl
  before('Start the server', async function() {
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
    const res = await fetch(`${baseUrl}/:fruit-apple-green.svg`)
    expect(res.ok).to.be.true
    expect(await res.text())
      .to.satisfy(isSvg)
      .and.to.include('fruit')
      .and.to.include('apple')
  })

  it('should produce colorscheme PNG badges', async function() {
    const res = await fetch(`${baseUrl}/:fruit-apple-green.png`)
    expect(res.ok).to.be.true
    expect(await res.buffer()).to.satisfy(isPng)
  })

  it('should preserve label case', async function() {
    const res = await fetch(`${baseUrl}/:fRuiT-apple-green.svg`)
    expect(res.ok).to.be.true
    expect(await res.text())
      .to.satisfy(isSvg)
      .and.to.include('fRuiT')
  })

  // https://github.com/badges/shields/pull/1319
  it('should not crash with a numeric logo', async function() {
    const res = await fetch(`${baseUrl}/:fruit-apple-green.svg?logo=1`)
    expect(res.ok).to.be.true
    expect(await res.text())
      .to.satisfy(isSvg)
      .and.to.include('fruit')
      .and.to.include('apple')
  })

  it('should not crash with a numeric link', async function() {
    const res = await fetch(`${baseUrl}/:fruit-apple-green.svg?link=1`)
    expect(res.ok).to.be.true
    expect(await res.text())
      .to.satisfy(isSvg)
      .and.to.include('fruit')
      .and.to.include('apple')
  })

  it('should not crash with a boolean link', async function() {
    const res = await fetch(`${baseUrl}/:fruit-apple-green.svg?link=true`)
    expect(res.ok).to.be.true
    expect(await res.text())
      .to.satisfy(isSvg)
      .and.to.include('fruit')
      .and.to.include('apple')
  })

  it('should return the 404 badge for unknown badges', async function() {
    const res = await fetch(`${baseUrl}/this/is/not/a/badge.svg`)
    expect(res.status).to.equal(404)
    expect(await res.text())
      .to.satisfy(isSvg)
      .and.to.include('404')
      .and.to.include('badge not found')
  })

  it('should return the 404 html page for rando links', async function() {
    const res = await fetch(`${baseUrl}/this/is/most/definitely/not/a/badge.js`)
    expect(res.status).to.equal(404)
    expect(await res.text()).to.include('blood, toil, tears and sweat')
  })

  context('with svg2img error', function() {
    const expectedError = fs.readFileSync(
      path.resolve(__dirname, '..', 'public', '500.html')
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
      const res = await fetch(`${baseUrl}/:some_new-badge-green.png`)
      // This emits status code 200, though 500 would be preferable.
      expect(res.status).to.equal(200)
      expect(await res.text()).to.include(expectedError)
    })
  })

  describe('analytics endpoint', function() {
    it('should return analytics in the expected format', async function() {
      const res = await fetch(`${baseUrl}/$analytics/v1`)
      expect(res.ok).to.be.true
      const json = await res.json()
      const expectedKeys = [
        'vendorMonthly',
        'rawMonthly',
        'vendorFlatMonthly',
        'rawFlatMonthly',
        'vendorFlatSquareMonthly',
        'rawFlatSquareMonthly',
      ]
      expect(json).to.have.all.keys(...expectedKeys)

      Object.values(json).forEach(stats => {
        expect(stats)
          .to.be.an('array')
          .with.length(36)
      })
    })
  })
})
