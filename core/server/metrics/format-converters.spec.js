'use strict'

const { expect } = require('chai')
const { promClientJsonToInflux } = require('./format-converters')

describe('Metric format converters', function() {
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
