'use strict'

const { expect } = require('chai')
const Camp = require('camp')
const portfinder = require('portfinder')
const got = require('../got-test-client')
const InfluxMetrics = require('./influx-metrics')
const InstanceMetadata = require('./instance-metadata')

describe('Influx metrics', function() {
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
      await new InfluxMetrics(
        metricInstance,
        new InstanceMetadata({ id: 'instance2' }),
        {}
      ).registerMetricsEndpoint(camp)

      const { headers, body, statusCode } = await got(
        `${baseUrl}/metrics-influx`
      )

      expect(statusCode).to.be.equal(200)
      expect(body).to.contain(
        'prometheus,env=test,instance=instance2,service=shields counter1=11'
      )
      expect(headers).to.have.property('content-type', 'text/plain')
    })
  })
})
