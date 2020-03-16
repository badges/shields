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
      ask.res.end(this.metrics())
    })
  }

  async startPushingMetrics() {
    const sendMetrics = (metricInstance, instanceMetadata) => {
      // TODO allow to log metrics in debug mode
      const auth = {
        user: this._config.username,
        pass: this._config.password,
      }
      request.post(
        {
          uri: this._config.uri,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: this.metrics(),
          timeout: this._config.timeoutMillseconds,
          auth,
        },
        (err, res, body) => {
          // TODO log errors
          if (err) {
            console.log(err)
          }
        }
      )
    }
    this._intervalId = setInterval(
      sendMetrics,
      this._config.intervalSeconds * 1000,
      this._metricInstance,
      this._instanceMetadata
    )
  }

  metrics() {
    return promClientJsonToInfluxV2(this._metricInstance.metrics(), {
      env: this._instanceMetadata.env,
      service: 'shields',
      instance: this._instanceMetadata.id || this._instanceMetadata.hostname,
    })
  }

  stopPushingMetrics() {
    if (this._intervalId) {
      clearInterval(this._intervalId)
      this._intervalId = undefined
    }
  }
}
