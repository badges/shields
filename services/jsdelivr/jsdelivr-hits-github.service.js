'use strict'

const { schema, periodMap, BaseJsDelivrService } = require('./jsdelivr-base')

module.exports = class jsDelivrHitsGitHub extends BaseJsDelivrService {
  static get route() {
    return {
      base: 'jsdelivr/gh',
      pattern: ':period(hd|hw|hm|hy)/:user/:repo',
    }
  }

  async handle({ period, user, repo }) {
    const { total } = await this.fetch({ period, user, repo })
    return this.constructor.render({ period, hits: total })
  }

  async fetch({ period, user, repo }) {
    return this._requestJson({
      schema,
      url: `https://data.jsdelivr.com/v1/package/gh/${user}/${repo}/stats/date/${
        periodMap[period]
      }`,
    })
  }

  static get examples() {
    return [
      {
        title: 'jsDelivr Hits (GitHub)',
        pattern: 'hd/:user/:repo',
        namedParams: {
          user: 'jquery',
          repo: 'jquery',
        },
        staticPreview: this.render({ period: 'hd', hits: 272042 }),
      },
      {
        title: 'jsDelivr Hits (GitHub)',
        pattern: 'hw/:user/:repo',
        namedParams: {
          user: 'jquery',
          repo: 'jquery',
        },
        staticPreview: this.render({ period: 'hw', hits: 2156336 }),
      },
      {
        title: 'jsDelivr Hits (GitHub)',
        pattern: 'hm/:user/:repo',
        namedParams: {
          user: 'jquery',
          repo: 'jquery',
        },
        staticPreview: this.render({ period: 'hm', hits: 9809876 }),
      },
      {
        title: 'jsDelivr Hits (GitHub)',
        pattern: 'hy/:user/:repo',
        namedParams: {
          user: 'jquery',
          repo: 'jquery',
        },
        staticPreview: this.render({ period: 'hy', hits: 95317723 }),
      },
    ]
  }
}
