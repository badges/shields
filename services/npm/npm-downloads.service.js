'use strict'

const Joi = require('joi')
const { metric } = require('../text-formatters')
const { BaseJsonService } = require('..')
const { nonNegativeInteger } = require('../validators')

// https://github.com/npm/registry/blob/master/docs/download-counts.md#output
const pointResponseSchema = Joi.object({
  downloads: nonNegativeInteger,
}).required()

// https://github.com/npm/registry/blob/master/docs/download-counts.md#output-1
const rangeResponseSchema = Joi.object({
  downloads: Joi.array()
    .items(pointResponseSchema)
    .required(),
}).required()

function DownloadsForInterval(interval) {
  const { base, messageSuffix = '', query, isRange = false, name } = {
    week: {
      base: 'npm/dw',
      messageSuffix: '/w',
      query: 'point/last-week',
      name: 'NpmDownloadsWeek',
    },
    month: {
      base: 'npm/dm',
      messageSuffix: '/m',
      query: 'point/last-month',
      name: 'NpmDownloadsMonth',
    },
    year: {
      base: 'npm/dy',
      messageSuffix: '/y',
      query: 'point/last-year',
      name: 'NpmDownloadsYear',
    },
    total: {
      base: 'npm/dt',
      query: 'range/1000-01-01:3000-01-01',
      isRange: true,
      name: 'NpmDownloadsTotal',
    },
  }[interval]

  const schema = isRange ? rangeResponseSchema : pointResponseSchema

  // This hits an entirely different API from the rest of the NPM services, so
  // it does not use NpmBase.
  return class NpmDownloads extends BaseJsonService {
    static get name() {
      return name
    }

    static get category() {
      return 'downloads'
    }

    static get route() {
      return {
        base,
        pattern: ':scope(@.+)?/:packageName',
      }
    }

    static get examples() {
      return [
        {
          title: 'npm',
          pattern: ':packageName',
          namedParams: { packageName: 'localeval' },
          staticPreview: this.render({ downloads: 30000 }),
          keywords: ['node'],
        },
      ]
    }

    static render({ downloads }) {
      return {
        message: `${metric(downloads)}${messageSuffix}`,
        color: downloads > 0 ? 'brightgreen' : 'red',
      }
    }

    async handle({ scope, packageName }) {
      const slug = scope ? `${scope}/${packageName}` : packageName
      let { downloads } = await this._requestJson({
        schema,
        url: `https://api.npmjs.org/downloads/${query}/${slug}`,
        errorMessages: { 404: 'package not found or too new' },
      })
      if (isRange) {
        downloads = downloads
          .map(item => item.downloads)
          .reduce((accum, current) => accum + current)
      }
      return this.constructor.render({ downloads })
    }
  }
}

module.exports = ['week', 'month', 'year', 'total'].map(DownloadsForInterval)
