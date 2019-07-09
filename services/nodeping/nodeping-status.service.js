'use strict'

const Joi = require('@hapi/joi')
const {
  queryParamSchema,
  exampleQueryParams,
  renderWebsiteStatus,
} = require('../website-status')
const { BaseJsonService } = require('..')

const schema = Joi.array()
  .items(Joi.object().keys({ su: Joi.boolean() }))
  .min(1)

/*
 * this is the checkUuid for the NodePing.com (as used on the [example page](https://nodeping.com/reporting.html#results))
 */
const exampleCheckUuid = 'jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei'

module.exports = class NodePingStatus extends BaseJsonService {
  static get category() {
    return 'monitoring'
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
        queryParams: exampleQueryParams,
        staticPreview: renderWebsiteStatus({ isUp: true }),
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'Status',
    }
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
    return { isUp: rows[0].su }
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
    const { isUp } = await this.fetch({ checkUuid })
    return renderWebsiteStatus({
      isUp,
      upMessage,
      downMessage,
      upColor,
      downColor,
    })
  }
}
