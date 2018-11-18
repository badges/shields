'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const { downloadCount } = require('../../lib/color-formatters')
const { metric } = require('../../lib/text-formatters')
const { nonNegativeInteger } = require('../validators')

const pypiStatsSchema = Joi.object({
  data: Joi.object({
    last_day: nonNegativeInteger,
    last_week: nonNegativeInteger,
    last_month: nonNegativeInteger,
  }),
}).required()

const periodMap = {
  dd: {
    api_field: 'last_day',
    suffix: '/day',
  },
  dw: {
    api_field: 'last_week',
    suffix: '/week',
  },
  dm: {
    api_field: 'last_month',
    suffix: '/month',
  },
}

// this badge uses PyPI Stats instead of the PyPI API
// so it doesn't extend PypiBase
module.exports = class PypiDownloads extends BaseJsonService {
  async fetch({ pkg }) {
    const url = `https://pypistats.org/api/packages/${pkg.toLowerCase()}/recent`
    return this._requestJson({
      url,
      schema: pypiStatsSchema,
      errorMessages: { 404: 'package not found' },
    })
  }

  static render({ period, downloads }) {
    return {
      message: `${metric(downloads)}${periodMap[period].suffix}`,
      color: downloadCount(downloads),
    }
  }

  async handle({ period, pkg }) {
    const json = await this.fetch({ pkg })
    return this.constructor.render({
      period,
      downloads: json.data[periodMap[period].api_field],
    })
  }

  static get defaultBadgeData() {
    return { label: 'downloads' }
  }

  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'pypi',
      pattern: ':period(dd|dw|dm)/:pkg',
    }
  }

  static get examples() {
    return [
      {
        title: 'PyPI - Downloads',
        exampleUrl: 'dd/Django',
        pattern: 'dd/:package',
        staticExample: this.render({ period: 'dd', downloads: 14000 }),
        keywords: ['python'],
      },
      {
        title: 'PyPI - Downloads',
        exampleUrl: 'dw/Django',
        pattern: 'dw/:package',
        staticExample: this.render({ period: 'dw', downloads: 250000 }),
        keywords: ['python'],
      },
      {
        title: 'PyPI - Downloads',
        exampleUrl: 'dm/Django',
        pattern: 'dm/:package',
        staticExample: this.render({ period: 'dm', downloads: 1070100 }),
        keywords: ['python'],
      },
    ]
  }
}
