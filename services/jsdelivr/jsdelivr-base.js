import Joi from 'joi'
import { renderDownloadsBadge } from '../downloads.js'
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

  static render({ period, hits: downloads }) {
    return renderDownloadsBadge({ downloads, interval: periodMap[period] })
  }
}

export { schema, periodMap, BaseJsDelivrService }
