'use strict'

const Joi = require('@hapi/joi')
const { isBuildStatus, renderBuildStatusBadge } = require('../build-status')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  status: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
}).required()

const statusMap = {
  unstable: 'yellow',
  running: 'blue',
}

module.exports = class ContinuousPhp extends BaseJsonService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'continuousphp',
      pattern: ':provider/:user/:repo/:branch*',
    }
  }

  static get examples() {
    return [
      {
        title: 'continuousphp',
        pattern: ':provider/:user/:repo',
        namedParams: {
          provider: 'git-hub',
          user: 'doctrine',
          repo: 'dbal',
        },
        staticPreview: renderBuildStatusBadge({ status: 'passing' }),
      },
      {
        title: 'continuousphp',
        pattern: ':provider/:user/:repo/:branch',
        namedParams: {
          provider: 'git-hub',
          user: 'doctrine',
          repo: 'dbal',
          branch: 'master',
        },
        staticPreview: renderBuildStatusBadge({ status: 'passing' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'continuousphp' }
  }

  static render({ status }) {
    const badge = renderBuildStatusBadge({ label: 'build', status })
    const customColor = statusMap[status]
    if (customColor) {
      badge.color = customColor
    }
    return badge
  }

  async fetch({ provider, user, repo, branch }) {
    const url = `https://status.continuousphp.com/${provider}/${user}/${repo}/status-info`
    return this._requestJson({
      schema,
      url,
      options: { qs: { branch } },
      errorMessages: {
        404: 'project not found',
      },
    })
  }

  async handle({ provider, user, repo, branch }) {
    const json = await this.fetch({ provider, user, repo, branch })
    return this.constructor.render({ status: json.status })
  }
}
