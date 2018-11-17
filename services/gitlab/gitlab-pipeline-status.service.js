'use strict'

const Joi = require('joi')
const validate = require('../../lib/validate')
const BaseSvgScrapingService = require('../base-svg-scraping')
const { InvalidParameter, NotFound } = require('../errors')
const { isPipelineStatus } = require('./gitlab-helpers')

const badgeSchema = Joi.object({
  message: Joi.alternatives()
    .try([isPipelineStatus, Joi.equal('unknown')])
    .required(),
}).required()

const queryParamsSchema = Joi.object({
  // TODO This accepts URLs with query strings and fragments, which should be
  // rejected.
  gitlab_url: Joi.string().uri({ scheme: ['https'] }),
}).required()

module.exports = class GitlabPipelineStatus extends BaseSvgScrapingService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'gitlab/pipeline',
      format: '([^/]+)/([^/]+)(?:/([^/]+))?',
      capture: ['user', 'repo', 'branch'],
      // Trailing optional parameters don't work. The issue relates to the `.`
      // separator before the extension.
      // pattern: ':user/:repo/:branch?',
      queryParams: ['gitlab_url'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Gitlab pipeline status',
        pattern: ':user/:repo',
        namedParams: { user: 'gitlab-org', repo: 'gitlab-ce' },
        staticExample: this.render({ status: 'passed' }),
      },
      {
        title: 'Gitlab pipeline status (branch)',
        pattern: ':user/:repo/:branch',
        namedParams: {
          user: 'gitlab-org',
          repo: 'gitlab-ce',
          branch: 'master',
        },
        staticExample: this.render({ status: 'passed' }),
      },
      {
        title: 'Gitlab pipeline status (self-hosted)',
        pattern: ':user/:repo',
        namedParams: { user: 'GNOME', repo: 'pango' },
        query: { gitlab_url: 'https://gitlab.gnome.org' },
        staticExample: this.render({ status: 'passed' }),
      },
    ]
  }

  static validateQueryParams(queryParams) {
    return validate(
      {
        ErrorClass: InvalidParameter,
        prettyErrorMessage: 'invalid query parameter',
        traceErrorMessage: 'Query params did not match schema',
        traceSuccessMessage: 'Query params after validation',
      },
      queryParams,
      queryParamsSchema
    )
  }

  static render({ status }) {
    const color = {
      pending: 'yellow',
      running: 'yellow',
      passed: 'brightgreen',
      failed: 'red',
      skipped: 'lightgray',
      canceled: 'lightgray',
    }[status]

    return {
      message: status,
      color,
    }
  }

  async handle({ user, repo, branch = 'master' }, queryParams) {
    const {
      gitlab_url: baseUrl = 'https://gitlab.com',
    } = this.constructor.validateQueryParams(queryParams)
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
