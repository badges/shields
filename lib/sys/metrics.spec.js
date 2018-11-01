'use strict'

const { expect } = require('chai')
const Camp = require('camp')
const fetch = require('node-fetch')
const config = require('../test-config')
const Metrics = require('./metrics')

describe('Prometheus metrics route', function() {
  const baseUrl = `http://127.0.0.1:${config.port}`

  let camp
  afterEach(function(done) {
    if (camp) {
      camp.close(() => done())
      camp = undefined
    }
  })

  function startServer(metricsConfig) {
    return new Promise((resolve, reject) => {
      camp = Camp.start({ port: config.port, hostname: '::' })
      const metrics = new Metrics(metricsConfig)
      metrics.initialize(camp)
      camp.on('listening', () => resolve())
    })
  }

  before(function() {})

  it('returns 404 when metrics are disabled', async function() {
    startServer({ prometheus: { enabled: false } })

    const res = await fetch(`${baseUrl}/metrics`)

    expect(res.status).to.be.equal(404)
  })

  it('returns metrics when metrics are enabled', async function() {
    startServer({ prometheus: { enabled: true } })

    const res = await fetch(`${baseUrl}/metrics`)

    expect(res.status).to.be.equal(200)
    expect(await res.text()).to.be.contains('nodejs_version_info')
  })
})
