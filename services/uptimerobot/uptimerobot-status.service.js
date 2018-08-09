'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('../base')
const { InvalidParameter, InvalidResponse } = require('../errors')

// https://uptimerobot.com/api
// POST getMonitors
const errorResponseSchema = Joi.object({
  stat: Joi.equal('fail').required(),
  error: Joi.object({
    message: Joi.string(),
  }),
}).required()

const successResponseSchema = Joi.object({
  stat: Joi.equal('ok').required(),
  monitors: Joi.array()
    .length(1)
    .items(
      Joi.object({
        status: Joi.equal(0, 1, 2, 8, 9).required(),
      })
    )
    .required(),
}).required()

const schema = Joi.alternatives().try([
  errorResponseSchema,
  successResponseSchema,
])

module.exports = class UptimeRobotStatus extends BaseJsonService {
  static get category() {
    return 'other'
  }

  static get defaultBadgeData() {
    return {
      label: 'status',
    }
  }

  static get url() {
    return {
      base: 'uptimerobot/status',
      format: '(.*)',
      capture: ['monitorApiKey'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Uptime Robot status',
        previewUrl: 'm778918918-3e92c097147760ee39d02d36',
      },
    ]
  }

  async handle({ monitorApiKey }) {
    // A monitor API key must start with "m".
    if (!monitorApiKey.startsWith('m')) {
      throw new InvalidParameter({
        prettyMessage: 'must use a monitor-specific api key',
      })
    }

    const { stat, error = {}, monitors } = await this._requestJson({
      schema,
      url: 'https://api.uptimerobot.com/v2/getMonitors',
      options: {
        method: 'POST',
        headers: {
          'cache-control': 'no-cache',
          'content-type': 'application/x-www-form-urlencoded',
        },
        form: {
          api_key: monitorApiKey,
          format: 'json',
        },
      },
    })

    if (stat === 'fail') {
      const { message } = error
      throw new InvalidResponse({ prettyMessage: message })
    }

    switch (monitors[0].status) {
      case 0:
        return { message: 'paused', color: 'yellow' }
      case 1:
        return { message: 'not checked yet', color: 'yellowgreen' }
      case 2:
        return { message: 'up', color: 'brightgreen' }
      case 8:
        return { message: 'seems down', color: 'orange' }
      case 9:
        return { message: 'down', color: 'red' }
      default:
        throw Error('Should not get here due to validation')
    }
  }
}
