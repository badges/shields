'use strict'

const { schema, periodMap, BaseJsDelivrService } = require('./jsdelivr-base')

module.exports = class jsDelivrHitsNPM extends BaseJsDelivrService {
  static get route() {
    return {
      base: 'jsdelivr/npm',
      pattern: ':period(hd|hw|hm|hy)/:pkg',
    }
  }

  async handle({ period, pkg }) {
    const { total } = await this.fetch({ period, pkg })
    return this.constructor.render({ period, hits: total })
  }

  async fetch({ period, pkg }) {
    return this._requestJson({
      schema,
      url: `https://data.jsdelivr.com/v1/package/npm/${pkg}/stats/date/${
        periodMap[period]
      }`,
    })
  }

  static get examples() {
    return [
      {
        title: 'jsDelivr Hits (npm)',
        pattern: 'hd/:packageName',
        namedParams: {
          packageName: 'jquery',
        },
        staticPreview: this.render({ period: 'hd', hits: 31471644 }),
      },
      {
        title: 'jsDelivr Hits (npm)',
        pattern: 'hw/:packageName',
        namedParams: {
          packageName: 'jquery',
        },
        staticPreview: this.render({ period: 'hw', hits: 209922436 }),
      },
      {
        title: 'jsDelivr Hits (npm)',
        pattern: 'hm/:packageName',
        namedParams: {
          packageName: 'jquery',
        },
        staticPreview: this.render({ period: 'hm', hits: 920101789 }),
      },
      {
        title: 'jsDelivr Hits (npm)',
        pattern: 'hy/:packageName',
        namedParams: {
          packageName: 'jquery',
        },
        staticPreview: this.render({ period: 'hy', hits: 10576760414 }),
      },
    ]
  }
}
