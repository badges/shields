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
                'scrutinizer.quality': Joi.number().positive(),
              }).required(),
            }).required(),
          }).required(),
        }).required(),
      })
    )
    .required(),
}).required()

const scale = colorScale(
  [4, 5, 7, 9],
  ['red', 'orange', 'yellow', 'green', 'brightgreen']
)

class ScrutinizerQualityBase extends ScrutinizerBase {
  static get category() {
    return 'analysis'
  }

  static get defaultBadgeData() {
    return {
      label: 'code quality',
    }
  }

  static render({ score }) {
    return {
      message: `${Math.round(score * 100) / 100}`,
      color: scale(score),
    }
  }

  async makeBadge({ vcs, slug, branch }) {
    const json = await this.fetch({ schema, vcs, slug })
    const { value: score } = this.transformBranchInfoMetricValue({
      json,
      branch,
      metric: 'scrutinizer.quality',
    })
    return this.constructor.render({ score })
  }
}

class ScrutinizerQuality extends ScrutinizerQualityBase {
  static get route() {
    return {
      base: 'scrutinizer/quality',
      pattern: ':vcs(g|b)/:user/:repo/:branch*',
    }
  }

  static get examples() {
    return [
      {
        title: 'Scrutinizer code quality (GitHub/Bitbucket)',
        pattern: ':vcs(g|b)/:user/:repo/:branch?',
        namedParams: {
          vcs: 'g',
          user: 'filp',
          repo: 'whoops',
          branch: 'master',
        },
        staticPreview: this.render({ score: 8.26 }),
      },
    ]
  }

  async handle({ vcs, user, repo, branch }) {
    return this.makeBadge({
      vcs,
      slug: `${user}/${repo}`,
      branch,
    })
  }
}

class ScrutinizerQualityGitLab extends ScrutinizerQualityBase {
  static get route() {
    return {
      base: 'scrutinizer/quality/gl',
      pattern: ':instance/:user/:repo/:branch*',
    }
  }

  static get examples() {
    // There are no known anonymous accessible Scrutinizer reports available for GitLab repos.
    // The example used is valid, but the project will not be accessible if Shields users try to use it.
    // https://gitlab.propertywindow.nl/propertywindow/client
    // https://scrutinizer-ci.com/gl/propertywindow/propertywindow/client/badges/quality-score.png?b=master&s=dfae6992a48184cc2333b4c349cec0447f0d67c2
    return [
      {
        title: 'Scrutinizer coverage (GitLab)',
        pattern: ':instance/:user/:repo/:branch?',
        namedParams: {
          instance: 'propertywindow',
          user: 'propertywindow',
          repo: 'client',
          branch: 'master',
        },
        staticPreview: this.render({ score: 10.0 }),
      },
    ]
  }

  async handle({ instance, user, repo, branch }) {
    return this.makeBadge({
      vcs: 'gl',
      slug: `${instance}/${user}/${repo}`,
      branch,
    })
  }
}

class ScrutinizerQualityPlainGit extends ScrutinizerQualityBase {
  static get route() {
    return {
      base: 'scrutinizer/quality/gp',
      pattern: ':slug/:branch*',
    }
  }

  async handle({ slug, branch }) {
    return this.makeBadge({ vcs: 'gp', slug, branch })
  }
}

module.exports = [
  ScrutinizerQuality,
  ScrutinizerQualityGitLab,
  ScrutinizerQualityPlainGit,
]
