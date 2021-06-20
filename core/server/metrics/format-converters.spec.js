import { expect } from 'chai'
import prometheus from 'prom-client'
import { promClientJsonToInfluxV2 } from './format-converters.js'

describe('Metric format converters', function () {
  describe('prom-client JSON to InfluxDB line protocol (version 2)', function () {
    it('converts a counter', function () {
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

    it('converts a counter (from prometheus registry)', async function () {
      const register = new prometheus.Registry()
      const counter = new prometheus.Counter({
        name: 'counter1',
        help: 'counter 1 help',
        registers: [register],
      })
      counter.inc(11)

      const influx = promClientJsonToInfluxV2(await register.getMetricsAsJSON())

      expect(influx).to.be.equal('prometheus counter1=11')
    })

    it('converts a gauge', function () {
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

    it('converts a gauge (from prometheus registry)', async function () {
      const register = new prometheus.Registry()
      const gauge = new prometheus.Gauge({
        name: 'gauge1',
        help: 'gauge 1 help',
        registers: [register],
      })
      gauge.inc(20)

      const influx = promClientJsonToInfluxV2(await register.getMetricsAsJSON())

      expect(influx).to.be.equal('prometheus gauge1=20')
    })

    const sortLines = text => text.split('\n').sort().join('\n')

    it('converts a histogram', function () {
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

    it('converts a histogram (from prometheus registry)', async function () {
      const register = new prometheus.Registry()
      const histogram = new prometheus.Histogram({
        name: 'histogram1',
        help: 'histogram 1 help',
        buckets: [5, 15, 50],
        registers: [register],
      })
      histogram.observe(100)
      histogram.observe(10)
      histogram.observe(1)

      const influx = promClientJsonToInfluxV2(await register.getMetricsAsJSON())

      expect(sortLines(influx)).to.be.equal(
        sortLines(`prometheus,le=+Inf histogram1_bucket=3
prometheus,le=50 histogram1_bucket=2
prometheus,le=15 histogram1_bucket=2
prometheus,le=5 histogram1_bucket=1
prometheus histogram1_count=3,histogram1_sum=111`)
      )
    })

    it('converts a summary', function () {
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

    it('converts a summary (from prometheus registry)', async function () {
      const register = new prometheus.Registry()
      const summary = new prometheus.Summary({
        name: 'summary1',
        help: 'summary 1 help',
        percentiles: [0.1, 0.9, 0.99],
        registers: [register],
      })
      summary.observe(100)
      summary.observe(10)
      summary.observe(1)

      const influx = promClientJsonToInfluxV2(await register.getMetricsAsJSON())

      expect(sortLines(influx)).to.be.equal(
        sortLines(`prometheus,quantile=0.99 summary1=100
prometheus,quantile=0.9 summary1=100
prometheus,quantile=0.1 summary1=1
prometheus summary1_count=3,summary1_sum=111`)
      )
    })

    it('converts a counter and skip a timestamp', function () {
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

    it('converts a counter and adds extra labels', function () {
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
})
