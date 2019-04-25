'use strict'

const Joi = require('joi')
const { metric } = require('../text-formatters')
const { BaseJsonService } = require('..')
const { nonNegativeInteger } = require('../validators')

// https://github.com/npm/registry/blob/master/docs/download-counts.md#output
const pointResponseSchema = Joi.object({
  downloads: nonNegativeInteger,
}).required()

const intervalMap = {
  dw: {
    query: 'point/last-week',
    schema: pointResponseSchema,
    transform: json => json.downloads,
    messageSuffix: '/week',
  },
  dm: {
    query: 'point/last-month',
    schema: pointResponseSchema,
    transform: json => json.downloads,
    messageSuffix: '/month',
  },
  dy: {
    query: 'point/last-year',
    schema: pointResponseSchema,
    transform: json => json.downloads,
    messageSuffix: '/year',
  },
  dt: {
    query: 'range/1000-01-01:3000-01-01',
    // https://github.com/npm/registry/blob/master/docs/download-counts.md#output-1
    schema: Joi.object({
      downloads: Joi.array()
        .items(pointResponseSchema)
        .required(),
    }).required(),
    transform: json =>
      json.downloads
        .map(item => item.downloads)
        .reduce((accum, current) => accum + current),
    messageSuffix: '',
  },
}

// This hits an entirely different API from the rest of the NPM services, so
// it does not use NpmBase.
module.exports = class NpmDownloads extends BaseJsonService {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'npm',
      pattern: ':interval(dw|dm|dy|dt)/:scope(@.+)?/:packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'npm',
        namedParams: { interval: 'dw', packageName: 'localeval' },
        staticPreview: this.render({ interval: 'dw', downloadCount: 30000 }),
        keywords: ['node'],
      },
    ]
  }

  // For testing.
  static get _intervalMap() {
    return intervalMap
  }

  static render({ interval, downloadCount }) {
    const { messageSuffix } = intervalMap[interval]

    return {
      message: `${metric(downloadCount)}${messageSuffix}`,
      color: downloadCount > 0 ? 'brightgreen' : 'red',
    }
  }

  async handle({ interval, scope, packageName }) {
    const { query, schema, transform } = intervalMap[interval]

    const slug = scope ? `${scope}/${packageName}` : packageName
    const json = await this._requestJson({
      schema,
      url: `https://api.npmjs.org/downloads/${query}/${slug}`,
      errorMessages: { 404: 'package not found or too new' },
    })

    const downloadCount = transform(json)

    return this.constructor.render({ interval, downloadCount })
  }
}
