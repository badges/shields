import { expect } from 'chai'
import Camp from '@shields_io/camp'
import portfinder from 'portfinder'
import got from '../got-test-client.js'
import Metrics from './prometheus-metrics.js'

describe('Prometheus metrics route', function () {
  let port, baseUrl, camp, metrics
  beforeEach(async function () {
    port = await portfinder.getPortPromise()
    baseUrl = `http://127.0.0.1:${port}`
    camp = Camp.start({ port, hostname: '::' })
    await new Promise(resolve => camp.on('listening', () => resolve()))
  })
  afterEach(async function () {
    if (metrics) {
      metrics.stop()
    }
    if (camp) {
      await new Promise(resolve => camp.close(resolve))
      camp = undefined
    }
  })

  it('returns default metrics', async function () {
    metrics = new Metrics()
    metrics.registerMetricsEndpoint(camp)

    const { statusCode, body } = await got(`${baseUrl}/metrics`)

    expect(statusCode).to.be.equal(200)
    expect(body).to.contain('nodejs_version_info')
  })
})

describe('Prometheus service labels', function () {
  let metrics
  beforeEach(function () {
    metrics = new Metrics()
  })
  afterEach(function () {
    metrics.stop()
  })

  it('formats camel case and acronyms as snake case', async function () {
    const attrs = {
      category: 'build',
      serviceFamily: 'test',
      name: 'EclairAPIVersionStatus',
    }
    metrics.createNumRequestCounter(attrs).inc()
    metrics.createServiceResponseSizeHistogram(attrs).observe(1024)

    const recordedMetrics = await metrics.metrics()
    const counter = recordedMetrics.find(
      ({ name }) => name === 'service_requests_total',
    )
    const histogram = recordedMetrics.find(
      ({ name }) => name === 'service_response_bytes',
    )
    const expectedLabels = {
      category: 'build',
      family: 'test',
      service: 'eclair_api_version_status',
    }
    expect(counter.values[0].labels).to.include(expectedLabels)
    expect(histogram.values[0].labels).to.include(expectedLabels)
  })
})
