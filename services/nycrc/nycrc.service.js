'use strict'

const Joi = require('@hapi/joi')
const { coveragePercentage } = require('../color-formatters')
const {
  ConditionalGithubAuthV3Service,
} = require('../github/github-auth-service')
const { fetchJsonFromRepo } = require('../github/github-common-fetch')
const { InvalidResponse, NotFound } = require('..')

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

module.exports = class Nycrc extends ConditionalGithubAuthV3Service {
  static get category() {
    return 'coverage'
  }

  static get route() {
    return {
      base: 'nycrc',
      // TODO: eventually add support for .yml and .yaml:
      pattern: ':user/:repo',
      queryParamSchema: Joi.object({
        config: Joi.string()
          .valid('.nycrc', '.nycrc.json', 'package.json')
          .default('.nycrc'),
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
    return {
      message: `${coverage.toFixed(0)}%`,
      color: coveragePercentage(coverage),
    }
  }

  transform(config) {
    const { branches, lines } = config
    if (branches || lines) {
      // We favor branches over lines for the coverage badge, if both
      // thresholds are provided (as branches is the stricter requirement):
      return branches || lines
    } else {
      throw new InvalidResponse({
        prettyMessage: '"branches" or "lines" threshold missing',
      })
    }
  }

  async handle({ user, repo }, queryParams) {
    let coverage = NaN
    const { config } = queryParams
    if (config === '.nycrc' || config === '.nycrc.json') {
      coverage = this.transform(
        await fetchJsonFromRepo(this, {
          schema: nycrcSchema,
          user,
          repo,
          branch: 'master',
          filename: config,
        })
      )
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
        throw new NotFound({
          prettyMessage: 'no nyc or c8 stanza found',
        })
      } else {
        coverage = this.transform(nycConfig)
      }
    }
    return this.constructor.render({ coverage })
  }
}
