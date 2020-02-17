'use strict'

const { expect } = require('chai')
const {
  promClientJsonToInflux,
  promClientJsonToInfluxV2,
} = require('./format-converters')

describe('Metric format converters', function() {
  describe('prom-client JSON to InfluxDB line protocol (version 2)', function() {
    it('converts a counter', function() {
      const json = [
        {
          help: 'counter 1 help',
          name: 'counter1',
          type: 'counter',
          values: [{ value: 11, labels: {} }],
          aggregator: 'sum',
        },
      ]

      const influx = promClientJsonToInfluxV2(json)

      expect(influx).to.be.equal('prometheus counter1=11')
    })

    it('converts a gauge', function() {
      const json = [
        {
          help: 'gause 1 help',
          name: 'gauge1',
          type: 'gauge',
          values: [{ value: 20, labels: {} }],
          aggregator: 'sum',
        },
      ]

      const influx = promClientJsonToInfluxV2(json)

      expect(influx).to.be.equal('prometheus gauge1=20')
    })

    const sortLines = text =>
      text
        .split('\n')
        .sort()
        .join('\n')

    it('converts a histogram', function() {
      const json = [
        {
          name: 'histogram1',
          help: 'histogram 1 help',
          type: 'histogram',
          values: [
            { labels: { le: 5 }, value: 1, metricName: 'histogram1_bucket' },
            { labels: { le: 15 }, value: 2, metricName: 'histogram1_bucket' },
            { labels: { le: 50 }, value: 2, metricName: 'histogram1_bucket' },
            {
              labels: { le: '+Inf' },
              value: 3,
              metricName: 'histogram1_bucket',
            },
            { labels: {}, value: 111, metricName: 'histogram1_sum' },
            { labels: {}, value: 3, metricName: 'histogram1_count' },
          ],
          aggregator: 'sum',
        },
      ]

      const influx = promClientJsonToInfluxV2(json)

      expect(sortLines(influx)).to.be.equal(
        sortLines(`prometheus,le=+Inf histogram1_bucket=3
prometheus,le=50 histogram1_bucket=2
prometheus,le=15 histogram1_bucket=2
prometheus,le=5 histogram1_bucket=1
prometheus histogram1_count=3,histogram1_sum=111`)
      )
    })

    it('converts a summary', function() {
      const json = [
        {
          name: 'summary1',
          help: 'summary 1 help',
          type: 'summary',
          values: [
            { labels: { quantile: 0.1 }, value: 1 },
            { labels: { quantile: 0.9 }, value: 100 },
            { labels: { quantile: 0.99 }, value: 100 },
            { metricName: 'summary1_sum', labels: {}, value: 111 },
            { metricName: 'summary1_count', labels: {}, value: 3 },
          ],
          aggregator: 'sum',
        },
      ]

      const influx = promClientJsonToInfluxV2(json)

      expect(sortLines(influx)).to.be.equal(
        sortLines(`prometheus,quantile=0.99 summary1=100
prometheus,quantile=0.9 summary1=100
prometheus,quantile=0.1 summary1=1
prometheus summary1_count=3,summary1_sum=111`)
      )
    })

    it('converts a counter and skip a timestamp', function() {
      const json = [
        {
          help: 'counter 4 help',
          name: 'counter4',
          type: 'counter',
          values: [{ value: 11, labels: {}, timestamp: 1581850552292 }],
          aggregator: 'sum',
        },
      ]

      const influx = promClientJsonToInfluxV2(json)

      expect(influx).to.be.equal('prometheus counter4=11')
    })

    it('converts a counter and adds extra labels', function() {
      const json = [
        {
          help: 'counter 1 help',
          name: 'counter1',
          type: 'counter',
          values: [{ value: 11, labels: {} }],
          aggregator: 'sum',
        },
      ]

      const influx = promClientJsonToInfluxV2(json, {
        instance: 'instance1',
        env: 'production',
      })

      expect(influx).to.be.equal(
        'prometheus,env=production,instance=instance1 counter1=11'
      )
    })
  })

  describe('prom-client JSON to InfluxDB line protocol', function() {
    it('converts a metric without labels and with a timestamp', function() {
      const json = [
        {
          help: 'Total number of active handles.',
          name: 'nodejs_active_handles_total',
          type: 'gauge',
          values: [
            {
              value: 3,
              labels: {},
              timestamp: 1580576541941,
            },
          ],
          aggregator: 'sum',
        },
      ]

      const influx = promClientJsonToInflux(json)

      expect(influx).to.be.deep.equal([
        'nodejs_active_handles_total value=3 1580576541941',
      ])
    })

    it('converts a metric with values', function() {
      const json = [
        {
          help: 'Process heap space size available from node.js in bytes.',
          name: 'nodejs_heap_space_size_available_bytes',
          type: 'gauge',
          values: [
            {
              value: 229576,
              labels: {
                space: 'read_only',
              },
              timestamp: 1580576541942,
            },
            {
              value: 796296,
              labels: {
                space: 'new',
              },
              timestamp: 1580576541943,
            },
          ],
          aggregator: 'sum',
        },
      ]

      const influx = promClientJsonToInflux(json)

      expect(influx).to.be.deep.equal([
        'nodejs_heap_space_size_available_bytes,space=read_only value=229576 1580576541942',
        'nodejs_heap_space_size_available_bytes,space=new value=796296 1580576541943',
      ])
    })

    it('converts a metric with labels', function() {
      const json = [
        {
          help: 'Total service requests',
          name: 'service_requests_total',
          type: 'counter',
          values: [
            {
              value: 44,
              labels: {
                category: 'static',
                family: 'static-badge',
                service: 'static_badge',
              },
              timestamp: 1580576541943,
            },
          ],
          aggregator: 'sum',
        },
      ]

      const influx = promClientJsonToInflux(json)

      expect(influx).to.be.deep.equal([
        'service_requests_total,category=static,family=static-badge,service=static_badge value=44 1580576541943',
      ])
    })

    it('converts a metric without a timestamp', function() {
      const json = [
        {
          help: 'Start time of the process since unix epoch in seconds.',
          name: 'process_start_time_seconds',
          type: 'gauge',
          values: [
            {
              value: 1580576451,
              labels: {},
            },
          ],
          aggregator: 'omit',
        },
      ]

      const influx = promClientJsonToInflux(json)

      expect(influx).to.be.deep.equal([
        'process_start_time_seconds value=1580576451',
      ])
    })

    it('converts a metric with separate names', function() {
      const json = [
        {
          name: 'service_response_millis',
          help: 'Service response time in milliseconds',
          type: 'histogram',
          values: [
            {
              labels: {
                le: 250,
              },
              value: 28,
              metricName: 'service_response_millis_bucket',
            },
            {
              labels: {
                le: 500,
              },
              value: 29,
              metricName: 'service_response_millis_bucket',
            },
            {
              labels: {
                le: '+Inf',
              },
              value: 32,
              metricName: 'service_response_millis_bucket',
            },
            {
              labels: {},
              value: 3550.5951969996095,
              metricName: 'service_response_millis_sum',
            },
            {
              labels: {},
              value: 32,
              metricName: 'service_response_millis_count',
            },
          ],
          aggregator: 'sum',
        },
      ]

      const influx = promClientJsonToInflux(json)

      expect(influx).to.be.deep.equal([
        'service_response_millis_bucket,le=250 value=28',
        'service_response_millis_bucket,le=500 value=29',
        'service_response_millis_bucket,le=+Inf value=32',
        'service_response_millis_sum value=3550.5951969996095',
        'service_response_millis_count value=32',
      ])
    })
  })
})
