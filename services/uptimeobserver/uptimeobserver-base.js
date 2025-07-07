import Joi from 'joi'
import { BaseJsonService, InvalidParameter, InvalidResponse } from '../index.js'

const errorResponse = Joi.object({
  status: Joi.string().required(),
  error: Joi.string(),
}).required()

const monitorResponse = Joi.object({
  status: Joi.string().required(),
  friendlyName: Joi.string().required(),
  lastExecution: Joi.string().isoDate().required(),
  uptime24h: Joi.number().min(0).max(100).required(),
  uptime7d: Joi.number().min(0).max(100).required(),
  uptime30d: Joi.number().min(0).max(100).required(),
}).required()

const singleMonitorResponse = Joi.alternatives(monitorResponse, errorResponse)

export default class UptimeObserverBase extends BaseJsonService {
  static category = 'monitoring'

  static ensureIsMonitorApiKey(value) {
    if (!value || value.length <= 32) {
      throw new InvalidParameter({
        prettyMessage: 'monitor API key is required',
      })
    }
  }

  async fetch({ monitorKey }) {
    this.constructor.ensureIsMonitorApiKey(monitorKey)

    // Docs for API: https://support.uptimeobserver.com/shields-api.yaml
    const url = `https://app.uptimeobserver.com/api/monitor/status/${monitorKey}`

    const response = await this._requestJson({
      schema: singleMonitorResponse,
      url,
      options: {
        method: 'GET',
      },
      logErrors: [],
    })

    // Handle error responses
    if (response.error) {
      throw new InvalidResponse({
        prettyMessage: response.error || 'service error',
      })
    }

    return response
  }
}
