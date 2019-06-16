'use strict'

const { schema, periodMap, BaseJsDelivrService } = require('./jsdelivr-base')

module.exports = class jsDelivrHitsNPM extends BaseJsDelivrService {
  static get route() {
    return {
      base: 'jsdelivr/npm',
      pattern: ':period(hd|hw|hm|hy)/:scope(@[^/]+)?/:packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'jsDelivr hits (npm)',
        pattern: ':period(hd|hw|hm|hy)/:packageName',
        namedParams: {
          period: 'hm',
          packageName: 'jquery',
        },
        staticPreview: this.render({ period: 'hm', hits: 920101789 }),
      },
      {
        title: 'jsDelivr hits (npm scoped)',
        pattern: ':period(hd|hw|hm|hy)/:scope?/:packageName',
        namedParams: {
          period: 'hm',
          scope: '@angular',
          packageName: 'fire',
        },
        staticPreview: this.render({ period: 'hm', hits: 94123 }),
      },
    ]
  }

  async fetch({ period, packageName }) {
    return this._requestJson({
      schema,
      url: `https://data.jsdelivr.com/v1/package/npm/${packageName}/stats/date/${
        periodMap[period]
      }`,
    })
  }

  async handle({ period, scope, packageName }) {
    const { total } = await this.fetch({
      period,
      packageName: `${scope ? `${scope}/` : ''}${packageName}`,
    })
    return this.constructor.render({ period, hits: total })
  }
}
