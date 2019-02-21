'use strict'

const { expect } = require('chai')
const Camp = require('camp')
const portfinder = require('portfinder')
const fetch = require('node-fetch')
const Metrics = require('./prometheus-metrics')

describe('Prometheus metrics route', function() {
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

  it('returns 404 when metrics are disabled', async function() {
    new Metrics({ enabled: false }).initialize(camp)

    const res = await fetch(`${baseUrl}/metrics`)

    expect(res.status).to.be.equal(404)
    expect(await res.text()).to.not.contains('nodejs_version_info')
  })

  it('returns 404 when there is no configuration', async function() {
    new Metrics().initialize(camp)

    const res = await fetch(`${baseUrl}/metrics`)

    expect(res.status).to.be.equal(404)
    expect(await res.text()).to.not.contains('nodejs_version_info')
  })

  it('returns metrics when enabled', async function() {
    new Metrics({ enabled: true }).initialize(camp)

    const res = await fetch(`${baseUrl}/metrics`)

    expect(res.status).to.be.equal(200)
    expect(await res.text()).to.contains('nodejs_version_info')
  })
})
