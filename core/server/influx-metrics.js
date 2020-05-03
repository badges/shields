'use strict'
const os = require('os')
const { promisify } = require('util')
const { post } = require('request')
const postAsync = promisify(post)
const generateInstanceId = require('./instance-id-generator')
const { promClientJsonToInfluxV2 } = require('./metrics/format-converters')
const log = require('./log')

module.exports = class InfluxMetrics {
  constructor(metricInstance, config) {
    this._metricInstance = metricInstance
    this._config = config
    this._instanceId = this.getInstanceId()
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
    return promClientJsonToInfluxV2(this._metricInstance.metrics(), {
      env: this._config.envLabel,
      application: 'shields',
      instance: this._instanceId,
    })
  }

  getInstanceId() {
    const {
      hostnameAliases = {},
      instanceIdFrom,
      instanceIdEnvVarName,
    } = this._config
    let instance
    if (instanceIdFrom === 'env-var') {
      instance = process.env[instanceIdEnvVarName]
    } else if (instanceIdFrom === 'hostname') {
      const hostname = os.hostname()
      instance = hostnameAliases[hostname] || hostname
    } else if (instanceIdFrom === 'random') {
      instance = generateInstanceId()
    }
    return instance
  }

  stopPushingMetrics() {
    if (this._intervalId) {
      clearInterval(this._intervalId)
      this._intervalId = undefined
    }
  }
}
