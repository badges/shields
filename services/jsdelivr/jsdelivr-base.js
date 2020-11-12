'use strict'

const Joi = require('joi')
const { downloadCount } = require('../color-formatters')
const { metric } = require('../text-formatters')
const { BaseJsonService } = require('..')

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

module.exports = { schema, periodMap, BaseJsDelivrService }
