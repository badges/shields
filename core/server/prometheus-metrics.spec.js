'use strict'

const { expect } = require('chai')
const Camp = require('@shields_io/camp')
const portfinder = require('portfinder')
const got = require('../got-test-client')
const Metrics = require('./prometheus-metrics')

describe('Prometheus metrics route', function() {
  let port, baseUrl, camp, metrics
  beforeEach(async function() {
    port = await portfinder.getPortPromise()
    baseUrl = `http://127.0.0.1:${port}`
    camp = Camp.start({ port, hostname: '::' })
    await new Promise(resolve => camp.on('listening', () => resolve()))
  })
  afterEach(async function() {
    if (metrics) {
      metrics.stop()
    }
    if (camp) {
      await new Promise(resolve => camp.close(resolve))
      camp = undefined
    }
  })

  it('returns default metrics', async function() {
    metrics = new Metrics()
    metrics.registerMetricsEndpoint(camp)

    const { statusCode, body } = await got(`${baseUrl}/metrics`)

    expect(statusCode).to.be.equal(200)
    expect(body).to.contain('nodejs_version_info')
  })
})
