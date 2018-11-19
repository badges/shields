'use strict'

const { expect } = require('chai')
const Camp = require('camp')
const fetch = require('node-fetch')
const config = require('../test-config')
const Metrics = require('./prometheus-metrics')

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

  it('returns 404 when metrics are disabled', async function() {
    startServer({ enabled: false })

    const res = await fetch(`${baseUrl}/metrics`)

    expect(res.status).to.be.equal(404)
    expect(await res.text()).to.not.contains('nodejs_version_info')
  })

  it('returns 404 when there is no configuration', async function() {
    startServer()

    const res = await fetch(`${baseUrl}/metrics`)

    expect(res.status).to.be.equal(404)
    expect(await res.text()).to.not.contains('nodejs_version_info')
  })

  it('returns metrics for allowed IP', async function() {
    startServer({
      enabled: true,
      allowedIps: '^(127\\.0\\.0\\.1|::1|::ffff:127\\.0\\.0\\.1)$',
    })

    const res = await fetch(`${baseUrl}/metrics`)

    expect(res.status).to.be.equal(200)
    expect(await res.text()).to.contains('nodejs_version_info')
  })

  it('returns metrics for request from allowed remote address', async function() {
    startServer({
      enabled: true,
      allowedIps: '^(127\\.0\\.0\\.1|::1|::ffff:127\\.0\\.0\\.1)$',
    })

    const res = await fetch(`${baseUrl}/metrics`)

    expect(res.status).to.be.equal(200)
    expect(await res.text()).to.contains('nodejs_version_info')
  })

  it('returns 403 for not allowed IP', async function() {
    startServer({
      enabled: true,
      allowedIps: '^127\\.0\\.0\\.200$',
    })

    const res = await fetch(`${baseUrl}/metrics`)

    expect(res.status).to.be.equal(403)
    expect(await res.text()).to.not.contains('nodejs_version_info')
  })

  it('returns 403 for every request when list with allowed IPs not defined', async function() {
    startServer({
      enabled: true,
    })

    const res = await fetch(`${baseUrl}/metrics`)

    expect(res.status).to.be.equal(403)
    expect(await res.text()).to.not.contains('nodejs_version_info')
  })
})
