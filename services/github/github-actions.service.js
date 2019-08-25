'use strict'

const Joi = require('@hapi/joi')
const { renderBuildStatusBadge } = require('../build-status')
const { nonNegativeInteger } = require('../validators')
const { GithubAuthV3Service } = require('./github-auth-service')
const { documentation, errorMessagesFor } = require('./github-helpers')
const { NotFound } = require('..')

const schema = Joi.object({
  total_count: nonNegativeInteger,
  check_suites: Joi.array()
    .items(
      Joi.object({
        status: Joi.string().required(),
        conclusion: Joi.string()
          .required()
          .allow(null),
        app: Joi.object({
          id: nonNegativeInteger,
          name: Joi.string().required(),
        }).required(),
      })
    )
    .min(0)
    .required(),
}).required()

module.exports = class GitHubActions extends GithubAuthV3Service {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'github/actions',
      pattern: ':user/:repo/:ref',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub Actions',
        namedParams: {
          user: 'actions',
          repo: 'setup-node',
          ref: 'master',
        },
        staticPreview: renderBuildStatusBadge({ status: 'success' }),
        documentation: `
          You can use a branch name, tag, or commit SHA for the ref parameter.
          ${documentation}
        `,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'workflow',
    }
  }

  static render({ status, conclusion }) {
    if (status !== 'completed') {
      return {
        message: 'in progress',
      }
    }
    return renderBuildStatusBadge({ status: conclusion })
  }

  async fetch({ user, repo, ref }) {
    return this._requestJson({
      url: `/repos/${user}/${repo}/commits/${ref}/check-suites`,
      options: {
        headers: {
          Accept: 'application/vnd.github.antiope-preview+json',
        },
      },
      schema,
      errorMessages: errorMessagesFor('repo or ref not found'),
    })
  }

  transform(json) {
    if (json.total_count === 0) {
      throw new NotFound({ prettyMessage: 'no GitHub Actions found' })
    }

    const actionsSuite = json.check_suites.find(
      suite => suite.app.name.toLowerCase() === 'github actions'
    )
    if (!actionsSuite) {
      throw new NotFound({ prettyMessage: 'no GitHub Actions found' })
    }

    return { status: actionsSuite.status, conclusion: actionsSuite.conclusion }
  }

  async handle({ user, repo, ref }) {
    const json = await this.fetch({ user, repo, ref })
    const { status, conclusion } = this.transform(json)
    return this.constructor.render({ status, conclusion })
  }
}
