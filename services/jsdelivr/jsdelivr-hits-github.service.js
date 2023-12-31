import { pathParams } from '../index.js'
import { schema, periodMap, BaseJsDelivrService } from './jsdelivr-base.js'

export default class JsDelivrHitsGitHub extends BaseJsDelivrService {
  static route = {
    base: 'jsdelivr/gh',
    pattern: ':period(hd|hw|hm|hy)/:user/:repo',
  }

  static openApi = {
    '/jsdelivr/gh/{period}/{user}/{repo}': {
      get: {
        summary: 'jsDelivr hits (GitHub)',
        parameters: pathParams(
          {
            name: 'period',
            example: 'hm',
            schema: { type: 'string', enum: this.getEnum('period') },
            description: 'Hits per Day, Week, Month or Year',
          },
          {
            name: 'user',
            example: 'jquery',
          },
          {
            name: 'repo',
            example: 'jquery',
          },
        ),
      },
    },
  }

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
