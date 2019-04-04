'use strict'

const Joi = require('joi')
const { colorScale } = require('../color-formatters')
const ScrutinizerBase = require('./scrutinizer-base')

const schema = Joi.object({
  default_branch: Joi.string().required(),
  applications: Joi.object()
    .pattern(
      /^/,
      Joi.object({
        index: Joi.object({
          _embedded: Joi.object({
            project: Joi.object({
              metric_values: Joi.object({
                'scrutinizer.test_coverage': Joi.number().positive(),
              }).required(),
            }).required(),
          }).required(),
        }).required(),
      })
    )
    .required(),
}).required()

// https://scrutinizer-ci.com/g/filp/whoops/code-structure/master/code-coverage
// < 40% - red
// 40-60% (inclusive) - yellow
// > 60% brightgreen
const scale = colorScale([40, 61], ['red', 'yellow', 'brightgreen'])

module.exports = class ScrutinizerCoverage extends ScrutinizerBase {
  static get category() {
    return 'coverage'
  }

  static get defaultBadgeData() {
    return {
      label: 'coverage',
    }
  }

  static get route() {
    return {
      base: 'scrutinizer/coverage',
      pattern: ':vcs/:user/:repo/:branch*',
    }
  }

  static render({ coverage }) {
    if (isNaN(coverage)) {
      return {
        message: 'unknown',
      }
    }
    return {
      message: `${coverage.toFixed(0)}%`,
      color: scale(coverage),
    }
  }

  static get examples() {
    return [
      {
        title: 'Scrutinizer coverage',
        pattern: ':vcs/:user/:repo',
        namedParams: {
          vcs: 'g',
          user: 'filp',
          repo: 'whoops',
        },
        staticPreview: this.render({ coverage: 56 }),
      },
      {
        title: 'Scrutinizer coverage (branch)',
        pattern: ':vcs/:user/:repo/:branch',
        namedParams: {
          vcs: 'g',
          user: 'doctrine',
          repo: 'orm',
          branch: 'master',
        },
        staticPreview: this.render({ coverage: 73 }),
      },
    ]
  }

  transform({ json, branch }) {
    branch = this.transformBranch({ json, branch })
    const project = json.applications[branch].index._embedded.project
    const coverage = project.metric_values['scrutinizer.test_coverage'] * 100
    return { coverage }
  }

  async handle({ vcs, user, repo, branch }) {
    const json = await this.fetch({ schema, vcs, user, repo })
    const { coverage } = this.transform({ json, branch })
    return this.constructor.render({ coverage })
  }
}
