'use strict';

const Joi = require('joi');
const { BaseJsonService } = require('../base');
const { metric } = require('../../lib/text-formatters');

// https://github.com/npm/registry/blob/master/docs/download-counts.md#output
const pointResponseSchema = Joi.object({
  downloads: Joi.number()
    .integer()
    .min(0)
    .required(),
}).required();

// https://github.com/npm/registry/blob/master/docs/download-counts.md#output-1
const rangeResponseSchema = Joi.object({
  downloads: Joi.array()
    .items(pointResponseSchema)
    .required(),
}).required();

function DownloadsForInterval(interval) {
  const { base, messageSuffix = '', query, isRange = false } = {
    week: {
      base: 'npm/dw',
      messageSuffix: '/w',
      query: 'point/last-week',
    },
    month: {
      base: 'npm/dm',
      messageSuffix: '/m',
      query: 'point/last-month',
    },
    year: {
      base: 'npm/dy',
      messageSuffix: '/y',
      query: 'point/last-year',
    },
    total: {
      base: 'npm/dt',
      query: 'range/1000-01-01:3000-01-01',
      isRange: true,
    },
  }[interval];

  const schema = isRange ? rangeResponseSchema : pointResponseSchema;

  // This hits an entirely different API from the rest of the NPM services, so
  // it does not use NpmBase.
  return class NpmDownloads extends BaseJsonService {
    static get category() {
      return 'downloads';
    }

    static get url() {
      return {
        base,
        format: '(.*)',
        capture: ['packageName'],
      };
    }

    static get examples() {
      return [
        {
          title: 'npm',
          previewUrl: 'localeval',
          keywords: ['node'],
        },
      ];
    }

    static render({ downloads }) {
      return {
        message: `${metric(downloads)}${messageSuffix}`,
        color: downloads > 0 ? 'brightgreen' : 'red',
      };
    }

    async handle({ packageName }) {
      const url = `https://api.npmjs.org/downloads/${query}/${packageName}`;
      let { downloads } = await this._requestJson({
        schema,
        url,
        notFoundMessage: 'project not found',
      });
      if (isRange) {
        downloads = downloads
          .map(item => item.downloads)
          .reduce((accum, current) => accum + current);
      }
      return this.constructor.render({ downloads });
    }
  };
}

module.exports = ['week', 'month', 'year', 'total'].map(DownloadsForInterval);
