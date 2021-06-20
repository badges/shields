import { schema, periodMap, BaseJsDelivrService } from './jsdelivr-base.js'

export default class JsDelivrHitsGitHub extends BaseJsDelivrService {
  static route = {
    base: 'jsdelivr/gh',
    pattern: ':period(hd|hw|hm|hy)/:user/:repo',
  }

  static examples = [
    {
      title: 'jsDelivr hits (GitHub)',
      namedParams: {
        period: 'hm',
        user: 'jquery',
        repo: 'jquery',
      },
      staticPreview: this.render({ period: 'hm', hits: 9809876 }),
    },
  ]

  async fetch({ period, user, repo }) {
    return this._requestJson({
      schema,
      url: `https://data.jsdelivr.com/v1/package/gh/${user}/${repo}/stats/date/${periodMap[period]}`,
    })
  }

  async handle({ period, user, repo }) {
    const { total } = await this.fetch({ period, user, repo })
    return this.constructor.render({ period, hits: total })
  }
}
