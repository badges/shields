'use strict'

const Joi = require('joi')
const { metric } = require('../../lib/text-formatters')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  total: Joi.number().required(),
}).required()

const keywords = ['jsDelivr', 'hits', 'npm']

const periodMap = {
  dd: 'day',
  dw: 'week',
  dm: 'month',
  dy: 'year',
}

class BaseJsDelivrService extends BaseJsonService {
  async handle({ period, pkg }) {
    const { total } = await this.fetch({ period, pkg })
    return this.constructor.render({ period, hits: total })
  }

  static render({ period, hits }) {
    return {
      message: `${metric(hits)} hits/${periodMap[period]}`,
      //color: downloadCount(hits),
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'jsDelivr',
      color: 'orange',
    }
  }

  static get category() {
    return 'other'
  }
}

module.exports = { schema, keywords, periodMap, BaseJsDelivrService }
