import os from 'os'
import ky from 'ky'
import generateInstanceId from './instance-id-generator.js'
import { promClientJsonToInfluxV2 } from './metrics/format-converters.js'
import log from './log.js'

export default class InfluxMetrics {
  constructor(metricInstance, config) {
    this._metricInstance = metricInstance
    this._config = config
    this._instanceId = this.getInstanceId()
  }

  async sendMetrics() {
    const request = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${this._config.username}:${this._config.password}`,
        ).toString('base64')}`,
      },
      body: await this.metrics(),
      signal: AbortSignal.timeout(this._config.timeoutMilliseconds),
      timeout: false,
      throwHttpErrors: false,
    }

    let response
    try {
      response = await ky.post(this._config.url, request)
      await response.text()
    } catch (error) {
      log.error(
        new Error(
          `Cannot push metrics. Cause: ${error.name}: ${error.message}`,
        ),
      )
    }
    if (response && response.status >= 300) {
      log.error(
        new Error(
          `Cannot push metrics. ${this._config.url} responded with status code ${response.status}`,
        ),
      )
    }
  }

  startPushingMetrics() {
    this._intervalId = setInterval(
      () => this.sendMetrics(),
      this._config.intervalSeconds * 1000,
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
