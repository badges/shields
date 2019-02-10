'use strict'

const Joi = require('joi')
const { downloadCount } = require('../../lib/color-formatters')
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

module.exports = class jsDelivrNPMHits extends BaseJsonService {
  static get route() {
    return {
      base: 'jsdelivr/npm/hits',
      pattern: ':period(dd|dw|dm|dy)/:pkg',
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'jsDelivr',
      color: 'orange',
    }
  }

  async handle({ period, pkg }) {
    const { total } = await this.fetch({ period, pkg })
    return this.constructor.render({ period, hits: total })
  }

  async fetch({ period, pkg }) {
    const url = `https://data.jsdelivr.com/v1/package/npm/${pkg}/stats/date/${
      periodMap[period]
    }`

    return this._requestJson({
      schema,
      url,
    })
  }

  static render({ period, hits }) {
    //jsDelivrNPMHits.log(`render-period: ${period}, hits: ${hits}`)
    return {
      message: `${metric(hits)} hits/${periodMap[period]}`,
      //color: downloadCount(hits),
    }
  }

  static get category() {
    return 'other'
  }

  static get examples() {
    return [
      {
        title: 'jsDelivr Hits (npm)',
        pattern: 'dd/:packageName',
        namedParams: {
          packageName: 'jquery',
        },
        staticPreview: this.render({ period: 'dd', hits: 31471644 }),
        keywords,
      },
      {
        title: 'jsDelivr Hits (npm)',
        pattern: 'dw/:packageName',
        namedParams: {
          packageName: 'jquery',
        },
        staticPreview: this.render({ period: 'dw', hits: 209922436 }),
        keywords,
      },
      {
        title: 'jsDelivr Hits (npm)',
        pattern: 'dm/:packageName',
        namedParams: {
          packageName: 'jquery',
        },
        staticPreview: this.render({ period: 'dm', hits: 920101789 }),
        keywords,
      },
      {
        title: 'jsDelivr Hits (npm)',
        pattern: 'dy/:packageName',
        namedParams: {
          packageName: 'jquery',
        },
        staticPreview: this.render({ period: 'dy', hits: 10576760414 }),
        keywords,
      },
    ]
  }
}
