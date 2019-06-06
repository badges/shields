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

const variantMap = {
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
        ':variant(dw|dm)/:vcs(github|bitbucket|gitlab|gitee)/:user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'JitPack - Downloads',
        namedParams: {
          variant: 'dm',
          vcs: 'github',
          user: 'jitpack',
          repo: 'maven-simple',
        },
        staticPreview: JitpackDownloads.render({
          downloads: 14000,
          variant: 'dm',
        }),
        keywords: ['java', 'maven'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'downloads' }
  }

  static render({ downloads, variant }) {
    return {
      message: `${metric(downloads)}${variantMap[variant].suffix}`,
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

  async handle({ variant, vcs, user, repo }) {
    const json = await this.fetch({ vcs, user, repo })
    return this.constructor.render({
      downloads: json[variantMap[variant].api_field],
      variant,
    })
  }
}
