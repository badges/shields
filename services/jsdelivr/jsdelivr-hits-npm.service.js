import { pathParams } from '../index.js'
import { schema, periodMap, BaseJsDelivrService } from './jsdelivr-base.js'

export default class JsDelivrHitsNPM extends BaseJsDelivrService {
  static route = {
    base: 'jsdelivr/npm',
    pattern: ':period(hd|hw|hm|hy)/:scope(@[^/]+)?/:packageName',
  }

  static openApi = {
    '/jsdelivr/npm/{period}/{packageName}': {
      get: {
        summary: 'jsDelivr hits (npm)',
        parameters: pathParams(
          {
            name: 'period',
            schema: { type: 'string', enum: this.getEnum('period') },
            example: 'hm',
            description: 'Hits per Day, Week, Month or Year',
          },
          {
            name: 'packageName',
            example: 'fire',
          },
        ),
      },
    },
    '/jsdelivr/npm/{period}/{scope}/{packageName}': {
      get: {
        summary: 'jsDelivr hits (npm scoped)',
        parameters: pathParams(
          {
            name: 'period',
            schema: { type: 'string', enum: this.getEnum('period') },
            example: 'hm',
            description: 'Hits per Day, Week, Month or Year',
          },
          {
            name: 'scope',
            example: '@angular',
          },
          {
            name: 'packageName',
            example: 'fire',
          },
        ),
      },
    },
  }

  async fetch({ period, packageName }) {
    return this._requestJson({
      schema,
      url: `https://data.jsdelivr.com/v1/package/npm/${packageName}/stats/date/${periodMap[period]}`,
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
