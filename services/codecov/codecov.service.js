'use strict'

const Joi = require('@hapi/joi')
const { coveragePercentage } = require('../color-formatters')
const { BaseSvgScrapingService } = require('..')

const queryParamSchema = Joi.object({
  token: Joi.string().regex(/^\w{10}$/),
  // https://docs.codecov.io/docs/flags
  // Flags must be lowercase, alphanumeric, and not exceed 45 characters
  flag: Joi.string().regex(/^[a-z0-9_]{1,45}$/),
}).required()

const schema = Joi.object({
  message: Joi.string()
    .regex(/^\d{1,3}%|unknown$/)
    .required(),
})

const svgValueMatcher = />(\d{1,3}%|unknown)<\/text><\/g>/

const documentation = `
  <p>
    You may specify a Codecov token to get coverage for a private repository.
  </p>
  <p>
    You can find the token for your badge in this url:
    <code>https://codecov.io/{vcsName}/{user}/{repo}/settings/badge</code>
  </p>
`

module.exports = class Codecov extends BaseSvgScrapingService {
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
          token: 'a1b2c3d4e5',
          flag: 'flag_name',
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
          token: 'a1b2c3d4e5',
          flag: 'flag_name',
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

  async fetch({ vcsName, user, repo, branch, token, flag }) {
    const url = `https://codecov.io/${vcsName}/${user}/${repo}${
      branch ? `/branches/${branch}` : ''
    }/graph/badge.svg`
    const queryParams = [flag && `flag=${flag}`, token && `token=${token}`]
      .filter(Boolean)
      .join('&')
    return this._requestSvg({
      schema,
      valueMatcher: svgValueMatcher,
      url: `${url}?${queryParams}`,
    })
  }

  transform({ data }) {
    // data extracted from svg. e.g.: 42% / unknown
    let coverage = data.message || 'unknown'
    if (coverage.slice(-1) === '%') {
      // remove the trailing %
      coverage = Number(coverage.slice(0, -1))
    }
    return { coverage }
  }

  async handle({ vcsName, user, repo, branch }, { token, flag }) {
    const data = await this.fetch({ vcsName, user, repo, branch, token, flag })
    const { coverage } = this.transform({ data })
    return this.constructor.render({ coverage })
  }
}
