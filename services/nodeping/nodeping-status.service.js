'use strict'

const { BaseJsonService } = require('..')
const Joi = require('joi')

const schema = Joi.array()
  .items(Joi.object().keys({ su: Joi.boolean() }))
  .min(1)

const queryParamSchema = Joi.object({
  up_message: Joi.string(),
  down_message: Joi.string(),
  up_color: Joi.alternatives(Joi.string(), Joi.number()),
  down_color: Joi.alternatives(Joi.string(), Joi.number()),
}).required()

/*
 * this is the checkUuid for the NodePing.com (as used on the [example page](https://nodeping.com/reporting.html#results))
 */
const exampleCheckUuid = 'jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei'

module.exports = class NodePingStatus extends BaseJsonService {
  static get category() {
    return 'monitoring'
  }

  static get defaultBadgeData() {
    return {
      label: 'Status',
    }
  }

  static get route() {
    return {
      base: 'nodeping/status',
      pattern: ':checkUuid',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'NodePing status',
        namedParams: {
          checkUuid: exampleCheckUuid,
        },
        staticPreview: this.render({ status: true }),
      },
      {
        title: 'NodePing status (customized)',
        namedParams: {
          checkUuid: exampleCheckUuid,
        },
        queryParams: {
          up_message: 'online',
          up_color: 'blue',
          down_message: 'offline',
          down_color: 'lightgrey',
        },
        staticPreview: this.render({
          status: true,
          upMessage: 'online',
          upColor: 'blue',
        }),
      },
    ]
  }

  async fetch({ checkUuid }) {
    const rows = await this._requestJson({
      schema,
      url: `https://nodeping.com/reports/results/${checkUuid}/1`,
      options: {
        qs: { format: 'json' },
        headers: {
          'cache-control': 'no-cache',
        },
      },
    })
    return { status: rows[0].su }
  }

  async handle(
    { checkUuid },
    {
      up_message: upMessage,
      down_message: downMessage,
      up_color: upColor,
      down_color: downColor,
    }
  ) {
    const { status } = await this.fetch({ checkUuid })
    return this.constructor.render({
      status,
      upMessage,
      downMessage,
      upColor,
      downColor,
    })
  }

  static render({ status, upMessage, downMessage, upColor, downColor }) {
    return status
      ? { message: upMessage || 'up', color: upColor || 'brightgreen' }
      : { message: downMessage || 'down', color: downColor || 'red' }
  }
}
