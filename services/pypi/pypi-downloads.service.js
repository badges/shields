'use strict'

const Joi = require('joi')
const { downloadCount } = require('../color-formatters')
const { metric } = require('../text-formatters')
const { BaseJsonService } = require('..')
const { nonNegativeInteger } = require('../validators')

const keywords = ['python']

const schema = Joi.object({
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
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'pypi',
      pattern: ':period(dd|dw|dm)/:packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'PyPI - Downloads',
        namedParams: {
          period: 'dd',
          packageName: 'Django',
        },
        staticPreview: this.render({ period: 'dd', downloads: 14000 }),
        keywords,
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'downloads' }
  }

  static render({ period, downloads }) {
    return {
      message: `${metric(downloads)}${periodMap[period].suffix}`,
      color: downloadCount(downloads),
    }
  }

  async fetch({ packageName }) {
    return this._requestJson({
      url: `https://pypistats.org/api/packages/${packageName.toLowerCase()}/recent`,
      schema,
      errorMessages: { 404: 'package not found' },
    })
  }

  async handle({ period, packageName }) {
    const json = await this.fetch({ packageName })
    return this.constructor.render({
      period,
      downloads: json.data[periodMap[period].api_field],
    })
  }
}
