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

module.exports = class ScrutinizerQuality extends ScrutinizerBase {
  static get category() {
    return 'analysis'
  }

  static get defaultBadgeData() {
    return {
      label: 'code quality',
    }
  }

  static get route() {
    return {
      base: 'scrutinizer/quality',
      pattern: ':vcs/:user/:repo/:branch*',
    }
  }

  static render({ score }) {
    return {
      message: `${Math.round(score * 100) / 100}`,
      color: scale(score),
    }
  }

  static get examples() {
    return [
      {
        title: 'Scrutinizer code quality',
        pattern: ':vcs/:user/:repo',
        namedParams: {
          vcs: 'g',
          user: 'filp',
          repo: 'whoops',
        },
        staticPreview: this.render({ score: 8.26 }),
      },
    ]
  }

  transform({ json, branch }) {
    branch = this.transformBranch({ json, branch })
    const project = json.applications[branch].index._embedded.project
    const score = project.metric_values['scrutinizer.quality']
    return { score }
  }

  async handle({ vcs, user, repo, branch }) {
    const json = await this.fetch({ schema, vcs, user, repo })
    const { score } = this.transform({ json, branch })
    return this.constructor.render({ score })
  }
}
