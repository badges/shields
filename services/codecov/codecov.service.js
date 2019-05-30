'use strict'

const Joi = require('@hapi/joi')
const { coveragePercentage } = require('../color-formatters')
const { BaseJsonService } = require('..')

// https://docs.codecov.io/reference#totals
// A new repository that's been added but never had any coverage reports
// uploaded will not have a `commit` object in the response and sometimes
// the `totals` object can also be missing for the latest commit.
// Accordingly the schema is a bit relaxed to support those scenarios
// and then they are handled in the transform and render functions.
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

const documentation = `
  <p>
    You may specify a Codecov token to get coverage for a private repository.
  </p>
  <p>
    See the <a href="https://docs.codecov.io/reference#authorization">Codecov Docs</a>
    for more information about creating a token.
  </p>
`

module.exports = class Codecov extends BaseJsonService {
  static get category() {
    return 'coverage'
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
        pattern: ':vcsName(github|gh|bitbucket|bb|gl|gitlab)/:user/:repo',
        namedParams: {
          vcsName: 'github',
          user: 'codecov',
          repo: 'example-python',
        },
        queryParams: {
          token: 'abc123def456',
        },
        staticPreview: this.render({ coverage: 90 }),
        documentation,
      },
      {
        title: 'Codecov branch',
        pattern:
          ':vcsName(github|gh|bitbucket|bb|gl|gitlab)/:user/:repo/:branch',
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
        documentation,
      },
    ]
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
