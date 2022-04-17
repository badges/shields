import { expect } from 'chai'
import express from 'express'
import portfinder from 'portfinder'
import got from '../got-test-client.js'
import Metrics from './prometheus-metrics.js'

describe('Prometheus metrics route', function () {
  let port, baseUrl, app, server, metrics
  beforeEach(async function () {
    port = await portfinder.getPortPromise()
    baseUrl = `http://127.0.0.1:${port}`
    app = express()
    await new Promise(resolve => {
      server = app.listen({ host: '::', port }, () => resolve())
    })
  })
  afterEach(async function () {
    if (metrics) {
      metrics.stop()
    }
    app = undefined
    if (server) {
      await new Promise(resolve => server.close(resolve))
      server = undefined
    }
  })

  it('returns default metrics', async function () {
    metrics = new Metrics()
    metrics.registerMetricsEndpoint(app)

    const { statusCode, body } = await got(`${baseUrl}/metrics`)

    expect(statusCode).to.be.equal(200)
    expect(body).to.contain('nodejs_version_info')
  })
})
