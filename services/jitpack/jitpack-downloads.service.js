'use strict'

const Joi = require('@hapi/joi')
const { nonNegativeInteger } = require('../validators')
const { downloadCount } = require('../color-formatters')
const { metric } = require('../text-formatters')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  week: nonNegativeInteger,
  month: nonNegativeInteger,
}).required()

const intervalMap = {
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
      pattern:
        ':interval(dw|dm)/:vcs(github|bitbucket|gitlab|gitee)/:user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'JitPack - Downloads',
        namedParams: {
          interval: 'dm',
          vcs: 'github',
          user: 'jitpack',
          repo: 'maven-simple',
        },
        staticPreview: JitpackDownloads.render({
          downloads: 14000,
          interval: 'dm',
        }),
        keywords: ['java', 'maven'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'downloads' }
  }

  static render({ downloads, interval }) {
    return {
      message: `${metric(downloads)}${intervalMap[interval].suffix}`,
      color: downloadCount(downloads),
    }
  }

  async fetch({ vcs, user, repo }) {
    return this._requestJson({
      schema,
      url: `https://jitpack.io/api/downloads/com.${vcs}.${user}/${repo}`,
      errorMessages: { 401: 'project not found or private' },
    })
  }

  async handle({ interval, vcs, user, repo }) {
    const json = await this.fetch({ vcs, user, repo })
    return this.constructor.render({
      downloads: json[intervalMap[interval].api_field],
      interval,
    })
  }
}
