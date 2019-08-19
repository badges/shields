'use strict'

const Joi = require('@hapi/joi')
const { isBuildStatus, renderBuildStatusBadge } = require('../build-status')
const { documentation } = require('./github-helpers')
const { BaseSvgScrapingService } = require('..')

const schema = Joi.object({
  message: isBuildStatus,
}).required()

module.exports = class GithubActions extends BaseSvgScrapingService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'github/actions',
      pattern: ':user/:repo/:workflow',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub Actions',
        namedParams: {
          user: 'actions',
          repo: 'toolkit',
          workflow: 'Main workflow',
        },
        staticPreview: renderBuildStatusBadge({
          status: 'passing',
        }),
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'build',
    }
  }

  async fetch({ user, repo, workflow }) {
    const { message: status } = await this._requestSvg({
      schema,
      url: `https://github.com/${user}/${repo}/workflows/${encodeURIComponent(
        workflow
      )}/badge.svg`,
      valueMatcher: />([^<>]+)<\/tspan><\/text><\/g><path/,
      errorMessages: {
        404: 'repo or workflow not found',
      },
    })

    return { status }
  }

  async handle({ user, repo, workflow }) {
    const { status } = await this.fetch({ user, repo, workflow })
    return renderBuildStatusBadge({ status })
  }
}
