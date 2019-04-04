'use strict'

const Joi = require('joi')
const { isBuildStatus, renderBuildStatusBadge } = require('../build-status')
const ScrutinizerBase = require('./scrutinizer-base')

const schema = Joi.object({
  default_branch: Joi.string().required(),
  applications: Joi.object()
    .pattern(
      /^/,
      Joi.object({
        build_status: Joi.object({
          status: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
        }).required(),
      })
    )
    .required(),
}).required()

module.exports = class ScrutinizerBuild extends ScrutinizerBase {
  static get category() {
    return 'build'
  }

  static get defaultBadgeData() {
    return {
      label: 'build',
    }
  }

  static get route() {
    return {
      base: 'scrutinizer/build',
      pattern: ':vcs/:user/:repo/:branch*',
    }
  }

  static get examples() {
    return [
      {
        title: 'Scrutinizer build',
        pattern: ':vcs/:user/:repo',
        namedParams: {
          vcs: 'g',
          user: 'filp',
          repo: 'whoops',
        },
        staticPreview: renderBuildStatusBadge({ status: 'passing' }),
      },
    ]
  }

  transform({ json, branch }) {
    branch = this.transformBranch({ json, branch })
    return { status: json.applications[branch].build_status.status }
  }

  async handle({ vcs, user, repo, branch }) {
    const json = await this.fetch({ schema, vcs, user, repo })
    const { status } = this.transform({ json, branch })
    return renderBuildStatusBadge({ status })
  }
}
