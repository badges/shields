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
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'jitpack',
      pattern: ':period(dw|dm)/:vcs(github|bitbucket|gitlab)/:user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'JitPack - Downloads',
        namedParams: {
          period: 'dm',
          vcs: 'github',
          user: 'jitpack',
          repo: 'maven-simple',
        },
        staticPreview: JitpackDownloads.render({
          downloads: 14000,
          period: 'dm',
        }),
        keywords: ['java', 'maven'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'downloads' }
  }

  static render({ downloads, period }) {
    return {
      message: `${metric(downloads)}${periodMap[period].suffix}`,
      color: downloadCount(downloads),
    }
  }

  async fetch({ vcs, user, repo }) {
    return this._requestJson({
      schema,
      url: `https://jitpack.io/api/stats/com.${vcs}.${user}/${repo}`,
      errorMessages: { 401: 'project not found or private' },
    })
  }

  async handle({ period, vcs, user, repo }) {
    const json = await this.fetch({ vcs, user, repo })
    return this.constructor.render({
      downloads: json[periodMap[period].api_field],
      period,
    })
  }
}
