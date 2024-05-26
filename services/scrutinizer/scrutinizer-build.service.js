import Joi from 'joi'
import { isBuildStatus, renderBuildStatusBadge } from '../build-status.js'
import { pathParams } from '../index.js'
import ScrutinizerBase from './scrutinizer-base.js'

const schema = Joi.object({
  default_branch: Joi.string().required(),
  applications: Joi.object()
    .pattern(
      /^/,
      Joi.object({
        build_status: Joi.object({
          status: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
        }).required(),
      }),
    )
    .required(),
}).required()

class ScrutinizerBuildBase extends ScrutinizerBase {
  static category = 'build'

  static defaultBadgeData = {
    label: 'build',
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
  static route = {
    base: 'scrutinizer/build',
    pattern: ':vcs(g|b)/:user/:repo/:branch*',
  }

  static openApi = {
    '/scrutinizer/build/{vcs}/{user}/{repo}': {
      get: {
        summary: 'Scrutinizer build (GitHub/Bitbucket)',
        parameters: pathParams(
          {
            name: 'vcs',
            example: 'g',
            description: 'Platform: Either GitHub or Bitbucket',
            schema: { type: 'string', enum: this.getEnum('vcs') },
          },
          { name: 'user', example: 'filp' },
          { name: 'repo', example: 'whoops' },
        ),
      },
    },
    '/scrutinizer/build/{vcs}/{user}/{repo}/{branch}': {
      get: {
        summary: 'Scrutinizer build (GitHub/Bitbucket) with branch',
        parameters: pathParams(
          {
            name: 'vcs',
            example: 'g',
            description: 'Platform: Either GitHub or Bitbucket',
            schema: { type: 'string', enum: this.getEnum('vcs') },
          },
          { name: 'user', example: 'filp' },
          { name: 'repo', example: 'whoops' },
          { name: 'branch', example: 'master' },
        ),
      },
    },
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
  static route = {
    base: 'scrutinizer/build/gl',
    pattern: ':instance/:user/:repo/:branch*',
  }

  // There are no known anonymous accessible Scrutinizer reports available for GitLab repos.
  // The example used is valid, but the project will not be accessible if Shields users try to use it.
  // https://gitlab.propertywindow.nl/propertywindow/client
  // https://scrutinizer-ci.com/gl/propertywindow/propertywindow/client/badges/quality-score.png?b=master&s=dfae6992a48184cc2333b4c349cec0447f0d67c2
  static openApi = {
    '/scrutinizer/build/gl/{instance}/{user}/{repo}': {
      get: {
        summary: 'Scrutinizer build (GitLab)',
        parameters: pathParams(
          { name: 'instance', example: 'propertywindow' },
          { name: 'user', example: 'propertywindow' },
          { name: 'repo', example: 'client' },
        ),
      },
    },
    '/scrutinizer/build/gl/{instance}/{user}/{repo}/{branch}': {
      get: {
        summary: 'Scrutinizer build (GitLab) with branch',
        parameters: pathParams(
          { name: 'instance', example: 'propertywindow' },
          { name: 'user', example: 'propertywindow' },
          { name: 'repo', example: 'client' },
          { name: 'branch', example: 'master' },
        ),
      },
    },
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
  static route = {
    base: 'scrutinizer/build/gp',
    pattern: ':slug/:branch*',
  }

  async handle({ slug, branch }) {
    return this.makeBadge({ vcs: 'gp', slug, branch })
  }
}

export default [
  ScrutinizerBuild,
  ScrutinizerGitLabBuild,
  ScrutinizerPlainGitBuild,
]
