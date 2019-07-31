'use strict'

const Joi = require('@hapi/joi')
const { renderVersionBadge } = require('../version')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  version: Joi.string().required(),
  status: Joi.string()
    .valid('ok')
    .required(),
}).required()

module.exports = class JitPackVersion extends BaseJsonService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'jitpack/v',
      pattern: ':vcs(github|bitbucket|gitlab|gitee)/:user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'JitPack',
        namedParams: {
          vcs: 'github',
          user: 'jitpack',
          repo: 'maven-simple',
        },
        staticPreview: renderVersionBadge({ version: 'v1.1' }),
        keywords: ['java', 'maven'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'jitpack' }
  }

  async fetch({ vcs, user, repo }) {
    const url = `https://jitpack.io/api/builds/com.${vcs}.${user}/${repo}/latest`

    return this._requestJson({
      schema,
      url,
      errorMessages: { 401: 'project not found or private' },
    })
  }

  async handle({ vcs, user, repo }) {
    const { version } = await this.fetch({ vcs, user, repo })
    return renderVersionBadge({ version })
  }
}
