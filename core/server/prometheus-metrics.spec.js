import { expect } from 'chai'
import { ExpressTestHarness } from '../express-test-harness.js'
import Metrics from './prometheus-metrics.js'

describe('Prometheus metrics route', function () {
  let harness, metrics
  beforeEach(async function () {
    harness = new ExpressTestHarness()

    metrics = new Metrics()
    metrics.registerMetricsEndpoint(harness.app)

    await harness.start()
  })

  afterEach(async function () {
    await harness.stop()
  })

  it('returns default metrics', async function () {
    const { statusCode, body } = await harness.get('/metrics')

    expect(statusCode).to.be.equal(200)
    expect(body).to.contain('nodejs_version_info')
  })
})
