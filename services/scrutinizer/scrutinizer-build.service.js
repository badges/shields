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

class ScrutinizerBuildBase extends ScrutinizerBase {
  static get category() {
    return 'build'
  }

  static get defaultBadgeData() {
    return {
      label: 'build',
    }
  }

  async makeBadge({ vcs, slug, branch }) {
    const json = await this.fetch({ schema, vcs, slug })
    const {
      build_status: { status },
    } = this.transformBranchInfo({ json, wantedBranch: branch })
    return renderBuildStatusBadge({ status })
  }
}

class ScrutinizerBuild extends ScrutinizerBuildBase {
  static get route() {
    return {
      base: 'scrutinizer/build',
      pattern: ':vcs(g|b)/:user/:repo/:branch*',
    }
  }

  static get examples() {
    return [
      {
        title: 'Scrutinizer build (GitHub/Bitbucket)',
        pattern: ':vcs(g|b)/:user/:repo/:branch?',
        namedParams: {
          vcs: 'g',
          user: 'filp',
          repo: 'whoops',
          branch: 'master',
        },
        staticPreview: renderBuildStatusBadge({ status: 'passing' }),
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

class ScrutinizerGitLabBuild extends ScrutinizerBuildBase {
  static get route() {
    return {
      base: 'scrutinizer/build/gl',
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
        title: 'Scrutinizer build (GitLab)',
        pattern: ':instance/:user/:repo/:branch?',
        namedParams: {
          instance: 'propertywindow',
          user: 'propertywindow',
          repo: 'client',
          branch: 'master',
        },
        staticPreview: renderBuildStatusBadge({ status: 'passing' }),
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

class ScrutinizerPlainGitBuild extends ScrutinizerBuildBase {
  static get route() {
    return {
      base: 'scrutinizer/build/gp',
      pattern: ':slug/:branch*',
    }
  }

  async handle({ slug, branch }) {
    return this.makeBadge({ vcs: 'gp', slug, branch })
  }
}

module.exports = [
  ScrutinizerBuild,
  ScrutinizerGitLabBuild,
  ScrutinizerPlainGitBuild,
]
