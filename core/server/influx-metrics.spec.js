'use strict'

const nock = require('nock')
const sinon = require('sinon')
const waitForExpect = require('wait-for-expect')
const { expect } = require('chai')
const Camp = require('camp')
const portfinder = require('portfinder')
const got = require('../got-test-client')
const log = require('./log')
const InfluxMetrics = require('./influx-metrics')
require('../register-chai-plugins.spec')
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
  const instanceMetadata = {
    id: 'instance2',
    env: 'test-env',
  }
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

  it('should add hostname as an instance label when hostnameAsAnInstanceId is enabled', async function() {
    const instanceMetadata = {
      id: 'instance2',
      env: 'test-env',
      hostname: 'test-hostname',
    }
    const customConfig = {
      hostnameAsAnInstanceId: true,
    }
    const influxMetrics = new InfluxMetrics(
      metricInstance,
      instanceMetadata,
      customConfig
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
        'prometheus,application=shields,env=test-env,instance=instance2 counter1=11'
      )
      expect(headers).to.have.property('content-type', 'text/plain')
    })
  })

  describe('pushing component', function() {
    let influxMetrics
    beforeEach(function() {
      sinon.spy(log, 'error')
    })
    afterEach(function() {
      log.error.restore()
      influxMetrics.stopPushingMetrics()
      nock.cleanAll()
      nock.enableNetConnect()
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
          'prometheus,application=shields,env=test-env,instance=instance2 counter1=11'
        )
        .basicAuth({ user: 'metrics-username', pass: 'metrics-password' })
        .reply(200)
      influxMetrics = new InfluxMetrics(metricInstance, instanceMetadata, {
        url: 'http://shields-metrics.io/metrics',
        timeoutMillseconds: 100,
        intervalSeconds: 0,
        username: 'metrics-username',
        password: 'metrics-password',
      })

      influxMetrics.startPushingMetrics()

      await waitForExpect(
        () => {
          expect(scope.isDone()).to.be.equal(
            true,
            `pending mocks: ${scope.pendingMocks()}`
          )
        },
        1000,
        1
      )
    })

    it('should log errors', async function() {
      nock.disableNetConnect()
      influxMetrics = new InfluxMetrics(metricInstance, instanceMetadata, {
        url: 'http://shields-metrics.io/metrics',
        timeoutMillseconds: 50,
        intervalSeconds: 0,
        username: 'metrics-username',
        password: 'metrics-password',
      })

      influxMetrics.startPushingMetrics()

      await waitForExpect(
        () => {
          expect(log.error).to.be.calledWith(
            sinon.match
              .instanceOf(Error)
              .and(
                sinon.match.has(
                  'message',
                  'Cannot push metrics. Cause: NetConnectNotAllowedError: Nock: Disallowed net connect for "shields-metrics.io:80/metrics"'
                )
              )
          )
        },
        1000,
        1
      )
    })

    it('should log error responses', async function() {
      nock('http://shields-metrics.io/')
        .persist()
        .post('/metrics')
        .reply(400)
      influxMetrics = new InfluxMetrics(metricInstance, instanceMetadata, {
        url: 'http://shields-metrics.io/metrics',
        timeoutMillseconds: 50,
        intervalSeconds: 0,
        username: 'metrics-username',
        password: 'metrics-password',
      })

      influxMetrics.startPushingMetrics()

      await waitForExpect(
        () => {
          expect(log.error).to.be.calledWith(
            sinon.match
              .instanceOf(Error)
              .and(
                sinon.match.has(
                  'message',
                  'Cannot push metrics. http://shields-metrics.io/metrics responded with status code 400'
                )
              )
          )
        },
        1000,
        1
      )
    })
  })
})
