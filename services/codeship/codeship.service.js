'use strict'

const Joi = require('joi')
const { BaseSvgScrapingService } = require('..')
const { isBuildStatus, renderBuildStatusBadge } = require('../build-status')

const schema = Joi.object({
  message: Joi.alternatives()
    .try(
      isBuildStatus,
      Joi.equal('project not found', 'branch not found', 'ignored', 'blocked')
    )
    .required(),
}).required()

const pendingStatus = 'pending'
const notBuiltStatus = 'not built'

const statusMap = {
  testing: pendingStatus,
  waiting: pendingStatus,
  initiated: pendingStatus,
  stopped: notBuiltStatus,
  ignored: notBuiltStatus,
  blocked: notBuiltStatus,
  infrastructure_failure: 'failed',
}

module.exports = class Codeship extends BaseSvgScrapingService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'codeship',
      pattern: ':projectId/:branch*',
    }
  }

  static get examples() {
    return [
      {
        title: 'Codeship',
        pattern: ':projectId',
        namedParams: {
          projectId: 'd6c1ddd0-16a3-0132-5f85-2e35c05e22b1',
        },
        staticPreview: renderBuildStatusBadge({ status: 'passing' }),
      },
      {
        title: 'Codeship (branch)',
        pattern: ':projectId/:branch',
        namedParams: {
          projectId: '0bdb0440-3af5-0133-00ea-0ebda3a33bf6',
          branch: 'master',
        },
        staticPreview: renderBuildStatusBadge({ status: 'passing' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'build' }
  }

  static render({ status }) {
    status = statusMap[status] || status
    return renderBuildStatusBadge({ status })
  }

  async fetch({ projectId, branch }) {
    const url = `https://app.codeship.com/projects/${projectId}/status`
    return this._requestSvg({
      schema,
      url,
      options: { qs: { branch } },
      valueMatcher: /<g id="status_2">(?:[.\s\S]*)\/><\/g><g id="([\w\s]*)"/,
    })
  }

  async handle({ projectId, branch }) {
    const { message: status } = await this.fetch({ projectId, branch })
    return this.constructor.render({ status })
  }
}
