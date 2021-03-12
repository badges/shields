'use strict'
const os = require('os')
const got = require('got')
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
    const request = {
      url: this._config.url,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: await this.metrics(),
      timeout: this._config.timeoutMillseconds,
      username: this._config.username,
      password: this._config.password,
      throwHttpErrors: false,
    }

    let response
    try {
      response = await got.post(request)
    } catch (error) {
      log.error(
        new Error(`Cannot push metrics. Cause: ${error.name}: ${error.message}`)
      )
    }
    if (response && response.statusCode >= 300) {
      log.error(
        new Error(
          `Cannot push metrics. ${request.url} responded with status code ${response.statusCode}`
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

  async metrics() {
    return promClientJsonToInfluxV2(await this._metricInstance.metrics(), {
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
