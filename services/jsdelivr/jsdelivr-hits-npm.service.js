import { pathParams } from '../index.js'
import { schema, periodMap, BaseJsDelivrService } from './jsdelivr-base.js'

export default class JsDelivrHitsNPM extends BaseJsDelivrService {
  static route = {
    base: 'jsdelivr/npm',
    pattern: ':period/:scope(@[^/]+)?/:packageName/:version?',
  }
  static routeEnum = ['hd', 'hw', 'hm', 'hy']

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
    '/jsdelivr/npm/{period}/{packageName}/{version}': {
      get: {
        summary: 'jsDelivr hits (npm, version)',
        parameters: pathParams(
          {
            name: 'period',
            schema: { type: 'string', enum: this.getEnum('period') },
            example: 'hm',
            description: 'Hits per Day, Week, Month or Year',
          },
          {
            name: 'packageName',
            example: 'jquery',
          },
          {
            name: 'version',
            example: '3.3.1',
          },
        ),
      },
    },
    '/jsdelivr/npm/{period}/{scope}/{packageName}/{version}': {
      get: {
        summary: 'jsDelivr hits (npm scoped, version)',
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
          {
            name: 'version',
            example: '7.6.1',
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

  async handle({ period, scope, packageName, version }) {
    const { total } = await this.fetch({
      period,
      packageName: `${scope ? `${scope}/` : ''}${packageName}${
        version ? `@${version}` : ''
      }`,
    })
    return this.constructor.render({ period, hits: total, version })
  }
}
