import Joi from 'joi'
import { BaseJsonService, InvalidParameter, InvalidResponse } from '../index.js'

// https://uptimerobot.com/api
// POST getMonitors
const errorResponse = Joi.object({
  stat: Joi.equal('fail').required(),
  error: Joi.object({
    message: Joi.string(),
  }).default({}),
}).required()

const monitor = Joi.object({
  status: Joi.equal(0, 1, 2, 8, 9).required(),
})

const monitorWithUptime = monitor.keys({
  custom_uptime_ratio: Joi.string()
    .regex(/^\d*\.\d{3}$/)
    .required(),
})

const singleMonitorResponse = Joi.alternatives(
  errorResponse,
  Joi.object({
    stat: Joi.equal('ok').required(),
    monitors: Joi.array().length(1).items(monitor).required(),
  }).required()
)

const singleMonitorResponseWithUptime = Joi.alternatives(
  errorResponse,
  Joi.object({
    stat: Joi.equal('ok').required(),
    monitors: Joi.array().length(1).items(monitorWithUptime).required(),
  }).required()
)

export default class UptimeRobotBase extends BaseJsonService {
  static category = 'monitoring'

  static ensureIsMonitorApiKey(value) {
    // A monitor API key must start with "m".
    if (!value.startsWith('m')) {
      throw new InvalidParameter({
        prettyMessage: 'must use a monitor-specific api key',
      })
    }
  }

  async fetch({ monitorSpecificKey, numberOfDays }) {
    this.constructor.ensureIsMonitorApiKey(monitorSpecificKey)

    let opts, schema
    if (numberOfDays) {
      opts = { custom_uptime_ratios: numberOfDays }
      schema = singleMonitorResponseWithUptime
    } else {
      opts = {}
      schema = singleMonitorResponse
    }
    const { stat, error, monitors } = await this._requestJson({
      schema,
      url: 'https://api.uptimerobot.com/v2/getMonitors',
      options: {
        method: 'POST',
        headers: {
          'cache-control': 'no-cache',
          'content-type': 'application/x-www-form-urlencoded',
        },
        form: {
          api_key: monitorSpecificKey,
          format: 'json',
          ...opts,
        },
      },
    })

    if (stat === 'fail') {
      const { message } = error
      throw new InvalidResponse({ prettyMessage: message || 'service error' })
    }

    return { monitors }
  }
}
