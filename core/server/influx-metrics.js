'use strict'

const { promisify } = require('util')
const { post } = require('request')
const postAsync = promisify(post)
const { promClientJsonToInfluxV2 } = require('./metrics/format-converters')
const log = require('./log')

module.exports = class InfluxMetrics {
  constructor(metricInstance, instanceMetadata, config) {
    this._metricInstance = metricInstance
    this._instanceMetadata = instanceMetadata
    this._config = config
  }

  async sendMetrics() {
    const auth = {
      user: this._config.username,
      pass: this._config.password,
    }
    const request = {
      uri: this._config.url,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: this.metrics(),
      timeout: this._config.timeoutMillseconds,
      auth,
    }

    let response
    try {
      response = await postAsync(request)
    } catch (error) {
      log.error(
        new Error(`Cannot push metrics. Cause: ${error.name}: ${error.message}`)
      )
    }
    if (response && response.statusCode >= 300) {
      log.error(
        new Error(
          `Cannot push metrics. ${response.request.href} responded with status code ${response.statusCode}`
        )
      )
    }
  }

  startPushingMetrics() {
    this._intervalId = setInterval(
      () => this.sendMetrics(),
      this._config.intervalSeconds * 1000
    )
  }

  metrics() {
    const { env, hostname, id } = this._instanceMetadata
    const { hostnameAliases = {}, hostnameAsAnInstanceId } = this._config
    const instance = hostnameAsAnInstanceId
      ? hostnameAliases[hostname] || hostname
      : id
    return promClientJsonToInfluxV2(this._metricInstance.metrics(), {
      env,
      application: 'shields',
      instance,
    })
  }

  stopPushingMetrics() {
    if (this._intervalId) {
      clearInterval(this._intervalId)
      this._intervalId = undefined
    }
  }
}
