'use strict'

const { expect } = require('chai')
const config = require('./lib/test-config')
const fetch = require('node-fetch')
const fs = require('fs')
const isPng = require('is-png')
const isSvg = require('is-svg')
const path = require('path')
const serverHelpers = require('./lib/in-process-server-test-helpers')
const sinon = require('sinon')
const Camp = require('camp')
const svg2img = require('./gh-badges/lib/svg-to-img')
const { handleRequest } = require('./lib/request-handler')
const { loadServiceClasses } = require('./services')

describe('The server', function() {
  let dummyCamp = Camp.start({ port: config.port, hostname: '::' })
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
      serviceClass.register({ camp: dummyCamp, handleRequest }, {})
    )
    dummyCamp.close()
    dummyCamp = undefined
  })
  after(function() {
    // Free up the port and shut down the server immediately, even when the
    // `before()` block fails during registration.
    if (dummyCamp) {
      dummyCamp.close()
      dummyCamp = undefined
    }
  })

  const baseUri = `http://127.0.0.1:${config.port}`

  let server
  before('Start running the server', function() {
    this.timeout(5000)
    server = serverHelpers.start()
  })
  after('Shut down the server', function() {
    serverHelpers.stop(server)
  })

  it('should produce colorscheme badges', async function() {
    // This is the first server test to run, and often times out.
    this.timeout(5000)
    const res = await fetch(`${baseUri}/:fruit-apple-green.svg`)
    expect(res.ok).to.be.true
    expect(await res.text())
      .to.satisfy(isSvg)
      .and.to.include('fruit')
      .and.to.include('apple')
  })

  it('should produce colorscheme PNG badges', async function() {
    this.timeout(5000)
    const res = await fetch(`${baseUri}/:fruit-apple-green.png`)
    expect(res.ok).to.be.true
    expect(await res.buffer()).to.satisfy(isPng)
  })

  it('should preserve label case', async function() {
    const res = await fetch(`${baseUri}/:fRuiT-apple-green.svg`)
    expect(res.ok).to.be.true
    expect(await res.text())
      .to.satisfy(isSvg)
      .and.to.include('fRuiT')
  })

  // https://github.com/badges/shields/pull/1319
  it('should not crash with a numeric logo', async function() {
    const res = await fetch(`${baseUri}/:fruit-apple-green.svg?logo=1`)
    expect(res.ok).to.be.true
    expect(await res.text())
      .to.satisfy(isSvg)
      .and.to.include('fruit')
      .and.to.include('apple')
  })

  it('should not crash with a numeric link', async function() {
    const res = await fetch(`${baseUri}/:fruit-apple-green.svg?link=1`)
    expect(res.ok).to.be.true
    expect(await res.text())
      .to.satisfy(isSvg)
      .and.to.include('fruit')
      .and.to.include('apple')
  })

  it('should not crash with a boolean link', async function() {
    const res = await fetch(`${baseUri}/:fruit-apple-green.svg?link=true`)
    expect(res.ok).to.be.true
    expect(await res.text())
      .to.satisfy(isSvg)
      .and.to.include('fruit')
      .and.to.include('apple')
  })

  context('with svg2img error', function() {
    const expectedError = fs.readFileSync(
      path.resolve(__dirname, 'public', '500.html')
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
      const res = await fetch(`${baseUri}/:some_new-badge-green.png`)
      // This emits status code 200, though 500 would be preferable.
      expect(res.status).to.equal(200)
      expect(await res.text()).to.include(expectedError)
    })
  })

  describe('analytics endpoint', function() {
    it('should return analytics in the expected format', async function() {
      const res = await fetch(`${baseUri}/$analytics/v1`)
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
