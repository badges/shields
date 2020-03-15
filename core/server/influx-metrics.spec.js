'use strict'

const nock = require('nock')
const waitForExpect = require('wait-for-expect')
const { expect } = require('chai')
const Camp = require('camp')
const portfinder = require('portfinder')
const got = require('../got-test-client')
const InfluxMetrics = require('./influx-metrics')
const InstanceMetadata = require('./instance-metadata')

describe('Influx metrics', function() {
  const metricInstance = {
    metrics() {
      return [
        {
          help: 'counter 1 help',
          name: 'counter1',
          type: 'counter',
          values: [{ value: 11, labels: {} }],
          aggregator: 'sum',
        },
      ]
    },
  }
  const instanceMetadata = new InstanceMetadata({
    id: 'instance2',
    env: 'test-env',
  })
  const config = {}
  describe('"metrics" function', function() {
    it('should add instance id as an instance label', async function() {
      const influxMetrics = new InfluxMetrics(
        metricInstance,
        instanceMetadata,
        config
      )

      expect(influxMetrics.metrics()).to.contain('instance=instance2')
    })
  })

  it('should add hostname as an instance label when instance id is empty', async function() {
    const instanceMetadata = new InstanceMetadata({
      id: '',
      env: 'test-env',
      hostname: 'test-hostname',
    })
    const influxMetrics = new InfluxMetrics(
      metricInstance,
      instanceMetadata,
      config
    )

    expect(influxMetrics.metrics()).to.be.contain('instance=test-hostname')
  })

  describe('endpoint', function() {
    let baseUrl, camp
    beforeEach(async function() {
      const port = await portfinder.getPortPromise()
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
    it('should return metrics', async function() {
      await new InfluxMetrics(
        metricInstance,
        instanceMetadata,
        config
      ).registerMetricsEndpoint(camp)

      const { headers, body, statusCode } = await got(
        `${baseUrl}/metrics-influx`
      )

      expect(statusCode).to.be.equal(200)
      expect(body).to.contain(
        'prometheus,env=test-env,instance=instance2,service=shields counter1=11'
      )
      expect(headers).to.have.property('content-type', 'text/plain')
    })
  })

  describe('pushing component', function() {
    let influxMetrics
    after(function() {
      influxMetrics.stopPushingMetrics()
    })
    it('should send metrics', async function() {
      const scope = nock('http://shields-metrics.io/', {
        reqheaders: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
        .persist()
        .post(
          '/metrics',
          'prometheus,env=test-env,instance=instance2,service=shields counter1=11'
        )
        .reply(200)
      influxMetrics = new InfluxMetrics(metricInstance, instanceMetadata, {
        uri: 'http://shields-metrics.io/metrics',
        timeoutMillseconds: 100,
        intervalSeconds: 0,
      })

      await influxMetrics.startPushingMetrics()

      await waitForExpect(() => {
        expect(scope.isDone()).to.be.equal(
          true,
          `pending mocks: ${scope.pendingMocks()}`
        )
      }, 100)
    })
  })
})
