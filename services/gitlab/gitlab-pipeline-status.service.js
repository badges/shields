'use strict'

const Joi = require('@hapi/joi')
const { isBuildStatus, renderBuildStatusBadge } = require('../build-status')
const { optionalUrl } = require('../validators')
const { BaseSvgScrapingService, NotFound } = require('..')

const badgeSchema = Joi.object({
  message: Joi.alternatives()
    .try(isBuildStatus, Joi.equal('unknown'))
    .required(),
}).required()

const queryParamSchema = Joi.object({
  gitlab_url: optionalUrl,
}).required()

module.exports = class GitlabPipelineStatus extends BaseSvgScrapingService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'gitlab/pipeline',
      pattern: ':user/:repo/:branch*',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'Gitlab pipeline status',
        pattern: ':user/:repo',
        namedParams: { user: 'gitlab-org', repo: 'gitlab-ce' },
        staticPreview: this.render({ status: 'passed' }),
      },
      {
        title: 'Gitlab pipeline status (branch)',
        pattern: ':user/:repo/:branch',
        namedParams: {
          user: 'gitlab-org',
          repo: 'gitlab-ce',
          branch: 'master',
        },
        staticPreview: this.render({ status: 'passed' }),
      },
      {
        title: 'Gitlab pipeline status (self-hosted)',
        pattern: ':user/:repo',
        namedParams: { user: 'GNOME', repo: 'pango' },
        queryParams: { gitlab_url: 'https://gitlab.gnome.org' },
        staticPreview: this.render({ status: 'passed' }),
      },
    ]
  }

  static render({ status }) {
    return renderBuildStatusBadge({ status })
  }

  async handle(
    { user, repo, branch = 'master' },
    { gitlab_url: baseUrl = 'https://gitlab.com' }
  ) {
    const { message: status } = await this._requestSvg({
      schema: badgeSchema,
      url: `${baseUrl}/${user}/${repo}/badges/${branch}/pipeline.svg`,
      errorMessages: {
        401: 'repo not found',
      },
    })
    if (status === 'unknown') {
      throw new NotFound({ prettyMessage: 'branch not found' })
    }
    return this.constructor.render({ status })
  }
}
