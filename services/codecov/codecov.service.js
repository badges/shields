'use strict'

const Joi = require('joi')
const { coveragePercentage } = require('../color-formatters')
const { BaseJsonService } = require('..')

// https://docs.codecov.io/reference#totals
// A new repository that's been added but never had any coverage reports
// uploaded will not have a `commit` object in the response and some times
// the `totals` object can also be missing for the latest commit.
// Keeping these as optional in the schema and handling it in the transform
// function to maintain consistent badge behavior with the legacy service implementation.
const schema = Joi.object({
  commit: Joi.object({
    totals: Joi.object({
      c: Joi.number().required(),
    }),
  }),
}).required()

const queryParamSchema = Joi.object({
  token: Joi.string(),
}).required()

module.exports = class Codecov extends BaseJsonService {
  static get category() {
    return 'coverage'
  }

  static get defaultBadgeData() {
    return { label: 'coverage' }
  }

  static render({ coverage }) {
    if (coverage === 'unknown') {
      return {
        message: coverage,
        color: 'lightgrey',
      }
    }
    return {
      message: `${coverage.toFixed(0)}%`,
      color: coveragePercentage(coverage),
    }
  }

  static get route() {
    return {
      base: 'codecov/c',
      // https://docs.codecov.io/docs#section-common-questions
      // Github, BitBucket, and GitLab are the only supported options (long or short form)
      pattern:
        ':vcsName(github|gh|bitbucket|bb|gl|gitlab)/:user/:repo/:branch*',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'Codecov',
        pattern: ':vcsName/:user/:repo',
        namedParams: {
          vcsName: 'github',
          user: 'codecov',
          repo: 'example-python',
        },
        queryParams: {
          token: 'abc123def456',
        },
        staticPreview: this.render({ coverage: 90 }),
      },
      {
        title: 'Codecov branch',
        pattern: ':vcsName/:user/:repo/:branch',
        namedParams: {
          vcsName: 'github',
          user: 'codecov',
          repo: 'example-python',
          branch: 'master',
        },
        queryParams: {
          token: 'abc123def456',
        },
        staticPreview: this.render({ coverage: 90 }),
      },
    ]
  }

  async fetch({ vcsName, user, repo, branch, token }) {
    // Codecov Docs: https://docs.codecov.io/reference#section-get-a-single-repository
    let url = `https://codecov.io/api/${vcsName}/${user}/${repo}`
    if (branch) {
      url += `/branches/${branch}`
    }
    const options = {}
    if (token) {
      options.headers = {
        Authorization: `token ${token}`,
      }
    }
    return this._requestJson({
      schema,
      options,
      url,
      errorMessages: {
        401: 'not authorized to access repository',
        404: 'repository not found',
      },
    })
  }

  transform({ json }) {
    if (!json.commit || !json.commit.totals) {
      return { coverage: 'unknown' }
    }

    return { coverage: +json.commit.totals.c }
  }

  async handle({ vcsName, user, repo, branch }, { token }) {
    const json = await this.fetch({ vcsName, user, repo, branch, token })
    const { coverage } = this.transform({ json })
    return this.constructor.render({ coverage })
  }
}
