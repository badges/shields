'use strict'

const Joi = require('joi')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService } = require('..')
const { downloadCount } = require('../color-formatters')
const { metric } = require('../text-formatters')

const schema = Joi.object({
  week: nonNegativeInteger,
  month: nonNegativeInteger,
}).required()

const periodMap = {
  dw: {
    api_field: 'week',
    suffix: '/week',
  },
  dm: {
    api_field: 'month',
    suffix: '/month',
  },
}

module.exports = class JitpackDownloads extends BaseJsonService {
  static get examples() {
    return [
      {
        title: 'JitPack - Downloads',
        namedParams: {
          groupId: 'jitpack',
          artifactId: 'maven-simple',
          period: 'dm',
        },
        staticPreview: JitpackDownloads.render({
          downloads: 14000,
          period: 'dm',
        }),
        keywords: ['java', 'maven'],
      },
    ]
  }

  static get category() {
    return 'downloads'
  }

  static get defaultBadgeData() {
    return { label: 'downloads' }
  }

  static get route() {
    return {
      base: 'jitpack',
      pattern: ':period(dw|dm)/:groupId/:artifactId',
    }
  }

  async handle({ period, groupId, artifactId }) {
    const json = await this.fetch({ groupId, artifactId })
    return this.constructor.render({
      downloads: json[periodMap[period].api_field],
      period,
    })
  }

  async fetch({ groupId, artifactId }) {
    return this._requestJson({
      schema,
      url: `https://jitpack.io/api/stats/com.github.${groupId}/${artifactId}`,
      errorMessages: { 401: 'project not found or private' },
    })
  }

  static render({ downloads, period }) {
    return {
      message: `${metric(downloads)}${periodMap[period].suffix}`,
      color: downloadCount(downloads),
    }
  }
}
