'use strict'

const Joi = require('@hapi/joi')
const { coveragePercentage } = require('../color-formatters')
const { GithubAuthV3Service } = require('../github/github-auth-service')
const { fetchJsonFromRepo } = require('../github/github-common-fetch')
const { InvalidParameter } = require('..')

const nycrcSchema = Joi.object({
  branches: Joi.number()
    .min(0)
    .max(100),
  lines: Joi.number()
    .min(0)
    .max(100),
}).required()

const pkgJSONSchema = Joi.object({
  c8: Joi.object({
    branches: Joi.number()
      .min(0)
      .max(100),
    lines: Joi.number()
      .min(0)
      .max(100),
  }).optional(),
  nyc: Joi.object({
    branches: Joi.number()
      .min(0)
      .max(100),
    lines: Joi.number()
      .min(0)
      .max(100),
  }).optional(),
}).required()

const documentation = `<p>
  Create a code coverage badge, based on thresholds stored in a
  <a href="https://github.com/istanbuljs/nyc#common-configuration-options">.nycrc config file</a>
  on GitHub.
</p>`

module.exports = class Nycrc extends GithubAuthV3Service {
  static get category() {
    return 'coverage'
  }

  static get route() {
    return {
      base: 'nycrc',
      // TODO: eventually add support for .yml and .yaml:
      pattern: ':user/:repo',
      queryParamSchema: Joi.object({
        config: Joi.string().valid('.nycrc', '.nycrc.json', 'package.json'),
      }).required(),
    }
  }

  static get examples() {
    return [
      {
        title: 'nycrc config on GitHub',
        namedParams: { user: 'yargs', repo: 'yargs' },
        queryParams: { config: '.nycrc' },
        staticPreview: this.render({ coverage: 92 }),
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'min coverage' }
  }

  static render({ coverage }) {
    if (typeof coverage === 'string') {
      return {
        message: coverage,
        color: coveragePercentage(0),
      }
    } else {
      return {
        message: `${coverage.toFixed(0)}%`,
        color: coveragePercentage(coverage),
      }
    }
  }

  async handle({ user, repo }, queryParams) {
    let coverage = 'unknown'
    const { config } = queryParams
    const missingFields = new InvalidParameter({
      prettyMessage: '"branches" or "lines" threshold missing',
    })
    if (config === '.nycrc' || config === '.nycrc.json') {
      const { branches, lines } = await fetchJsonFromRepo(this, {
        schema: nycrcSchema,
        user,
        repo,
        branch: 'master',
        filename: config,
      })
      if (branches || lines) {
        coverage = branches || lines
      } else {
        throw missingFields
      }
    } else if (config === 'package.json') {
      const pkgJson = await fetchJsonFromRepo(this, {
        schema: pkgJSONSchema,
        user,
        repo,
        branch: 'master',
        filename: config,
      })
      const nycConfig = pkgJson.c8 || pkgJson.nyc
      if (!nycConfig) {
        throw new InvalidParameter({
          prettyMessage: 'no nyc or c8 stanza found',
        })
      } else if (!(nycConfig.branches || nycConfig.lines)) {
        throw missingFields
      } else {
        coverage = nycConfig.branches || nycConfig.lines
      }
    }
    return this.constructor.render({ coverage })
  }
}
