import Joi from 'joi'
import { renderDownloadsBadge } from '../downloads.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, pathParams } from '../index.js'
import { packageNameDescription } from './npm-base.js'

// https://github.com/npm/registry/blob/master/docs/download-counts.md#output
const pointResponseSchema = Joi.object({
  downloads: nonNegativeInteger,
}).required()

const intervalMap = {
  dw: {
    query: 'point/last-week',
    schema: pointResponseSchema,
    transform: json => json.downloads,
    interval: 'week',
  },
  dm: {
    query: 'point/last-month',
    schema: pointResponseSchema,
    transform: json => json.downloads,
    interval: 'month',
  },
  dy: {
    query: 'point/last-year',
    schema: pointResponseSchema,
    transform: json => json.downloads,
    interval: 'year',
  },
  d18m: {
    query: 'range/1000-01-01:3000-01-01',
    // https://github.com/npm/registry/blob/master/docs/download-counts.md#output-1
    schema: Joi.object({
      downloads: Joi.array().items(pointResponseSchema).required(),
    }).required(),
    transform: json =>
      json.downloads
        .map(item => item.downloads)
        .reduce((accum, current) => accum + current),
  },
}

// This hits an entirely different API from the rest of the NPM services, so
// it does not use NpmBase.
export default class NpmDownloads extends BaseJsonService {
  static category = 'downloads'

  static route = {
    base: 'npm',
    pattern: ':interval(dw|dm|dy|d18m)/:scope(@.+)?/:packageName',
  }

  static openApi = {
    '/npm/{interval}/{packageName}': {
      get: {
        summary: 'NPM Downloads',
        parameters: pathParams(
          {
            name: 'interval',
            example: 'dw',
            description:
              'Downloads in the last Week, Month, Year, or 18 Months',
            schema: { type: 'string', enum: this.getEnum('interval') },
          },
          {
            name: 'packageName',
            example: 'localeval',
            description: packageNameDescription,
          },
        ),
      },
    },
  }

  // For testing.
  static _intervalMap = intervalMap

  static render({ interval, downloadCount: downloads }) {
    return renderDownloadsBadge({
      downloads,
      interval: intervalMap[interval].interval,
      colorOverride: downloads > 0 ? 'brightgreen' : 'red',
    })
  }

  async handle({ interval, scope, packageName }) {
    const { query, schema, transform } = intervalMap[interval]

    const slug = scope ? `${scope}/${packageName}` : packageName
    const json = await this._requestJson({
      schema,
      url: `https://api.npmjs.org/downloads/${query}/${slug}`,
      httpErrors: { 404: 'package not found or too new' },
    })

    const downloadCount = transform(json)

    return this.constructor.render({ interval, downloadCount })
  }
}
