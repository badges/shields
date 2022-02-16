import os from 'os'
import nock from 'nock'
import sinon from 'sinon'
import { expect } from 'chai'
import log from './log.js'
import InfluxMetrics from './influx-metrics.js'
import '../register-chai-plugins.spec.js'

describe('Influx metrics', function () {
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
  describe('"metrics" function', function () {
    let osHostnameStub
    afterEach(function () {
      nock.enableNetConnect()
      delete process.env.INSTANCE_ID
      if (osHostnameStub) {
        osHostnameStub.restore()
      }
    })
    it('should use an environment variable value as an instance label', async function () {
      process.env.INSTANCE_ID = 'instance3'
      const influxMetrics = new InfluxMetrics(metricInstance, {
        instanceIdFrom: 'env-var',
        instanceIdEnvVarName: 'INSTANCE_ID',
      })

      expect(await influxMetrics.metrics()).to.contain('instance=instance3')
    })

    it('should use a hostname as an instance label', async function () {
      osHostnameStub = sinon.stub(os, 'hostname').returns('test-hostname')
      const customConfig = {
        instanceIdFrom: 'hostname',
      }
      const influxMetrics = new InfluxMetrics(metricInstance, customConfig)

      expect(await influxMetrics.metrics()).to.be.contain(
        'instance=test-hostname'
      )
    })

    it('should use a random string as an instance label', async function () {
      const customConfig = {
        instanceIdFrom: 'random',
      }
      const influxMetrics = new InfluxMetrics(metricInstance, customConfig)

      expect(await influxMetrics.metrics()).to.be.match(/instance=\w+ /)
    })

    it('should use a hostname alias as an instance label', async function () {
      osHostnameStub = sinon.stub(os, 'hostname').returns('test-hostname')
      const customConfig = {
        instanceIdFrom: 'hostname',
        hostnameAliases: { 'test-hostname': 'test-hostname-alias' },
      }
      const influxMetrics = new InfluxMetrics(metricInstance, customConfig)

      expect(await influxMetrics.metrics()).to.be.contain(
        'instance=test-hostname-alias'
      )
    })
  })

  describe('startPushingMetrics', function () {
    let influxMetrics, clock
    beforeEach(function () {
      clock = sinon.useFakeTimers()
    })
    afterEach(function () {
      influxMetrics.stopPushingMetrics()
      nock.cleanAll()
      nock.enableNetConnect()
      delete process.env.INSTANCE_ID
      clock.restore()
    })

    it('should send metrics', async function () {
      const scope = nock('https://shields-metrics.io/', {
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
      process.env.INSTANCE_ID = 'instance2'
      influxMetrics = new InfluxMetrics(metricInstance, {
        url: 'https://shields-metrics.io/metrics',
        timeoutMillseconds: 100,
        intervalSeconds: 0.001,
        username: 'metrics-username',
        password: 'metrics-password',
        instanceIdFrom: 'env-var',
        instanceIdEnvVarName: 'INSTANCE_ID',
        envLabel: 'test-env',
      })

      influxMetrics.startPushingMetrics()

      await clock.tickAsync(10)
      expect(scope.isDone()).to.be.equal(
        true,
        `pending mocks: ${scope.pendingMocks()}`
      )
    })
  })

  describe('sendMetrics', function () {
    beforeEach(function () {
      sinon.stub(log, 'error')
    })
    afterEach(function () {
      log.error.restore()
      nock.cleanAll()
      nock.enableNetConnect()
    })

    const influxMetrics = new InfluxMetrics(metricInstance, {
      url: 'https://shields-metrics.io/metrics',
      timeoutMillseconds: 50,
      intervalSeconds: 0,
      username: 'metrics-username',
      password: 'metrics-password',
    })
    it('should log errors', async function () {
      nock.disableNetConnect()

      await influxMetrics.sendMetrics()

      expect(log.error).to.be.calledWith(
        sinon.match
          .instanceOf(Error)
          .and(
            sinon.match.has(
              'message',
              'Cannot push metrics. Cause: RequestError: Nock: Disallowed net connect for "shields-metrics.io:443/metrics"'
            )
          )
      )
    })

    it('should log error responses', async function () {
      nock('https://shields-metrics.io/').persist().post('/metrics').reply(400)

      await influxMetrics.sendMetrics()

      expect(log.error).to.be.calledWith(
        sinon.match
          .instanceOf(Error)
          .and(
            sinon.match.has(
              'message',
              'Cannot push metrics. https://shields-metrics.io/metrics responded with status code 400'
            )
          )
      )
    })
  })
})
