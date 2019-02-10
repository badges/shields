'use strict'

const {
  schema,
  keywords,
  periodMap,
  BaseJsDelivrService,
} = require('./jsdelivr-base')

module.exports = class jsDelivrNPMHits extends BaseJsDelivrService {
  static get route() {
    return {
      base: 'jsdelivr/hits/npm',
      pattern: ':period(dd|dw|dm|dy)/:pkg',
    }
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
