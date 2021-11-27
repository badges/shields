import Joi from 'joi'
import { colorScale } from '../color-formatters.js'
import { BaseJsonService } from '../index.js'

const colorFormatter = colorScale([99, 99.5, 100])

const rowSchema = Joi.object().keys({
  uptime: Joi.number().precision(3).min(0).max(100),
})

const schema = Joi.array().items(rowSchema).min(1)

/*
 * this is the checkUuid for the NodePing.com (as used on the [example page](https://nodeping.com/reporting.html#results))
 */
const sampleCheckUuid = 'jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei'

// TODO: support for custom # of days
// TODO: support for custom color thresholds
// TODO: support for custom colors
// TODO: support for custom '100%' label
// TODO: support for custom # of decimal places

export default class NodePingUptime extends BaseJsonService {
  static category = 'monitoring'

  static route = { base: 'nodeping/uptime', pattern: ':checkUuid' }

  static examples = [
    {
      title: 'NodePing uptime',
      namedParams: { checkUuid: sampleCheckUuid },
      staticPreview: this.render({ uptime: 99.999 }),
    },
  ]

  static defaultBadgeData = { label: 'uptime' }

  static formatPercentage(uptime) {
    if (uptime === 100.0) {
      return '100%'
    }
    return `${uptime.toFixed(3)}%`
  }

  static render({ uptime }) {
    return {
      message: NodePingUptime.formatPercentage(uptime),
      color: colorFormatter(uptime),
    }
  }

  async fetch({ checkUuid }) {
    const thirtyDaysAgo = new Date(
      new Date().getTime() - 30 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .slice(0, 10)

    const rows = await this._requestJson({
      schema,
      url: `https://nodeping.com/reports/uptime/${checkUuid}`,
      options: {
        searchParams: {
          format: 'json',
          interval: 'days',
          start: thirtyDaysAgo,
        },
        headers: {
          'cache-control': 'no-cache',
        },
      },
    })
    return { uptime: rows[rows.length - 1].uptime }
  }

  async handle({ checkUuid }) {
    const { uptime } = await this.fetch({ checkUuid })
    return this.constructor.render({ uptime })
  }
}
