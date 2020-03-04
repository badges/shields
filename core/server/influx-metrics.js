'use strict'

const request = require('request')
const { promClientJsonToInfluxV2 } = require('./metrics/format-converters')

module.exports = class InfluxMetrics {
  constructor(metricInstance, instanceMetadata, config) {
    this._metricInstance = metricInstance
    this._instanceMetadata = instanceMetadata
    this._config = config
  }

  async registerMetricsEndpoint(server) {
    server.route(/^\/metrics-influx$/, (data, match, end, ask) => {
      ask.res.setHeader('Content-Type', 'text/plain')
      ask.res.end(
        promClientJsonToInfluxV2(this._metricInstance.metrics(), {
          env: process.env.NODE_CONFIG_ENV,
          service: 'shields',
          instance: this._instanceMetadata.id,
        })
      )
    })
  }

  async startPushingMetrics() {
    const sendMetrics = (metricInstance, instanceMetadata) => {
      const metrics = promClientJsonToInfluxV2(metricInstance.metrics(), {
        env: process.env.NODE_CONFIG_ENV,
        service: 'shields',
        instance: instanceMetadata.id,
      })
      // TODO allow to log metrics in debug mode
      request.post(
        {
          uri: this._config.uri,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: metrics,
          timeout: this._config.timeoutMillseconds,
        },
        (err, res, body) => {
          // TODO log errors
        }
      )
    }
    this._intervalId = setInterval(
      sendMetrics,
      this._config.intervalSeconds,
      this._metricInstance,
      this._instanceMetadata
    )
  }

  stop() {
    if (this._intervalId) {
      clearInterval(this._intervalId)
      this._intervalId = undefined
    }
  }
}
