import Joi from 'joi'
import {
  queryParamSchema,
  exampleQueryParams,
  renderWebsiteStatus,
} from '../website-status.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.array()
  .items(Joi.object().keys({ su: Joi.boolean() }))
  .min(1)

/*
 * this is the checkUuid for the NodePing.com (as used on the [example page](https://nodeping.com/reporting.html#results))
 */
const exampleCheckUuid = 'jkiwn052-ntpp-4lbb-8d45-ihew6d9ucoei'

export default class NodePingStatus extends BaseJsonService {
  static category = 'monitoring'

  static route = {
    base: 'nodeping/status',
    pattern: ':checkUuid',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'NodePing status',
      namedParams: { checkUuid: exampleCheckUuid },
      queryParams: exampleQueryParams,
      staticPreview: renderWebsiteStatus({ isUp: true }),
    },
  ]

  static defaultBadgeData = { label: 'status' }

  async fetch({ checkUuid }) {
    const rows = await this._requestJson({
      schema,
      url: `https://nodeping.com/reports/results/${checkUuid}/1`,
      options: {
        searchParams: { format: 'json' },
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
