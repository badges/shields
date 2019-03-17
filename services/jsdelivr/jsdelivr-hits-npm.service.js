'use strict'

const { schema, periodMap, BaseJsDelivrService } = require('./jsdelivr-base')

module.exports = class jsDelivrHitsNPM extends BaseJsDelivrService {
  static get route() {
    return {
      base: 'jsdelivr/npm',
      pattern: ':period(hd|hw|hm|hy)/:packageName',
    }
  }

  async handle({ period, packageName }) {
    const { total } = await this.fetch({ period, packageName })
    return this.constructor.render({ period, hits: total })
  }

  async fetch({ period, packageName }) {
    return this._requestJson({
      schema,
      url: `https://data.jsdelivr.com/v1/package/npm/${packageName}/stats/date/${
        periodMap[period]
      }`,
    })
  }

  static get examples() {
    return [
      {
        title: 'jsDelivr hits (npm)',
        namedParams: {
          period: 'hm',
          packageName: 'jquery',
        },
        staticPreview: this.render({ period: 'hm', hits: 920101789 }),
      },
    ]
  }
}
