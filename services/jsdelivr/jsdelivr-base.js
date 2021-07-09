import Joi from 'joi'
import { downloadCount } from '../color-formatters.js'
import { metric } from '../text-formatters.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  total: Joi.number().required(),
}).required()

const periodMap = {
  hd: 'day',
  hw: 'week',
  hm: 'month',
  hy: 'year',
}

class BaseJsDelivrService extends BaseJsonService {
  static category = 'downloads'

  static defaultBadgeData = {
    label: 'jsdelivr',
  }

  static render({ period, hits }) {
    return {
      message: `${metric(hits)}/${periodMap[period]}`,
      color: downloadCount(hits),
    }
  }
}

export { schema, periodMap, BaseJsDelivrService }
