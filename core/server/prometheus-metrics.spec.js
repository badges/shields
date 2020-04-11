'use strict'

const { expect } = require('chai')
const Camp = require('camp')
const portfinder = require('portfinder')
const got = require('../got-test-client')
const Metrics = require('./prometheus-metrics')

describe('Prometheus metrics route', function() {
  let port, baseUrl, camp
  beforeEach(async function() {
    port = await portfinder.getPortPromise()
    baseUrl = `http://127.0.0.1:${port}`
    camp = Camp.start({ port, hostname: '::' })
    await new Promise(resolve => camp.on('listening', () => resolve()))
  })
  afterEach(async function() {
    if (camp) {
      await new Promise(resolve => camp.close(resolve))
      camp = undefined
    }
  })

  it('returns metrics', async function() {
    new Metrics().registerMetricsEndpoint(camp)

    const { statusCode } = await got(`${baseUrl}/metrics`)

    expect(statusCode).to.be.equal(200)
  })

  it('returns default metrics', async function() {
    const metrics = new Metrics()
    metrics.registerMetricsEndpoint(camp)

    const { body } = await got(`${baseUrl}/metrics`)

    expect(body).to.contain('nodejs_version_info')
  })
})
