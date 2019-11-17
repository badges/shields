'use strict'

const Joi = require('@hapi/joi')
const { isBuildStatus, renderBuildStatusBadge } = require('../build-status')
const { documentation } = require('./github-helpers')
const { BaseSvgScrapingService } = require('..')

const schema = Joi.object({
  message: Joi.alternatives()
    .try(isBuildStatus, Joi.equal('no status'))
    .required(),
}).required()

module.exports = class GithubActions extends BaseSvgScrapingService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'github/actions',
      pattern: ':user/:repo/:workflow/:branch*',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub Actions',
        pattern: ':user/:repo/:workflow',
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
      {
        title: 'GitHub Actions (branch)',
        pattern: ':user/:repo/:workflow/:branch',
        namedParams: {
          user: 'actions',
          repo: 'toolkit',
          workflow: 'Main workflow',
          branch: 'master',
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

  async fetch({ user, repo, workflow, branch }) {
    const { message: status } = await this._requestSvg({
      schema,
      url: `https://github.com/${user}/${repo}/workflows/${encodeURIComponent(
        workflow
      )}/badge.svg`,
      options: { qs: { branch } },
      valueMatcher: />([^<>]+)<\/tspan><\/text><\/g><path/,
      errorMessages: {
        404: 'repo, branch, or workflow not found',
      },
    })

    return { status }
  }

  async handle({ user, repo, workflow, branch }) {
    const { status } = await this.fetch({ user, repo, workflow, branch })
    return renderBuildStatusBadge({ status })
  }
}
