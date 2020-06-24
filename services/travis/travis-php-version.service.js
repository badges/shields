'use strict'

const Joi = require('@hapi/joi')
const request = require('request')
const {
  minorVersion,
  versionReduction,
  getPhpReleases,
} = require('../php-version')
const checkErrorResponse = require('../../core/base-service/check-error-response')
const { BaseJsonService } = require('..')

const optionalNumberOrString = Joi.alternatives(Joi.string(), Joi.number())
const travisSchema = Joi.object({
  branch: Joi.object({
    config: Joi.object({
      php: Joi.array().items(optionalNumberOrString),
      matrix: Joi.object({
        include: Joi.array().items(Joi.object({ php: optionalNumberOrString })),
      }),
      jobs: Joi.object({
        include: Joi.array().items(Joi.object({ php: optionalNumberOrString })),
      }),
    }).required(),
  }).required(),
}).required()
const githubRepoSchema = Joi.object({ default_branch: Joi.string().required() })

module.exports = class TravisPhpVersion extends BaseJsonService {
  static get category() {
    return 'platform-support'
  }

  static get route() {
    return {
      base: 'travis/php-v',
      pattern: ':user/:repo/:branch*',
    }
  }

  static get examples() {
    return [
      {
        title: 'PHP from Travis config',
        namedParams: { user: 'symfony', repo: 'symfony' },
        staticPreview: this.render({ reduction: ['^7.1.3'] }),
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'php',
    }
  }

  static render({ reduction, hasHhvm }) {
    return {
      message: reduction.concat(hasHhvm ? ['HHVM'] : []).join(', '),
      color: 'blue',
    }
  }

  constructor(context, config) {
    super(context, config)
    this._githubApiProvider = context.githubApiProvider
  }

  async transform({ branch: { config } }, phpReleases) {
    let travisVersions = []

    // from php
    if (config.php) {
      travisVersions = travisVersions.concat(config.php.map(v => v.toString()))
    }
    // from matrix
    if (config.matrix && config.matrix.include) {
      travisVersions = travisVersions.concat(
        config.matrix.include.filter(v => 'php' in v).map(v => v.php.toString())
      )
    }
    // from jobs
    if (config.jobs && config.jobs.include) {
      travisVersions = travisVersions.concat(
        config.jobs.include.filter(v => 'php' in v).map(v => v.php.toString())
      )
    }

    const versions = travisVersions
      .map(v => minorVersion(v))
      .filter(v => v.includes('.'))

    return {
      reduction: versionReduction(versions, phpReleases),
      hasHhvm: travisVersions.find(v => v.startsWith('hhvm')),
    }
  }

  async getDefaultBranch({ user, repo }) {
    const { res, buffer } = await this._githubApiProvider.requestAsPromise(
      request,
      `/repos/${user}/${repo}`
    )
    await checkErrorResponse({ 404: 'repo not found' })({ buffer, res })
    const json = this._parseJson(buffer)
    const { default_branch } = this.constructor._validate(
      json,
      githubRepoSchema
    )
    return default_branch
  }

  async handle({ user, repo, branch }) {
    let branchName
    let phpReleases

    if (branch == null) {
      await Promise.all([
        this.getDefaultBranch({ user, repo }),
        getPhpReleases(this._githubApiProvider),
      ]).then(res => {
        branchName = res[0]
        phpReleases = res[1]
      })
    } else {
      branchName = branch
      phpReleases = await getPhpReleases(this._githubApiProvider)
    }

    const travisConfig = await this._requestJson({
      schema: travisSchema,
      url: `https://api.travis-ci.org/repos/${user}/${repo}/branches/${branchName}`,
      errorMessages: {
        404: 'repo not found',
      },
    })

    const { reduction, hasHhvm } = await this.transform(
      travisConfig,
      phpReleases
    )
    return this.constructor.render({ reduction, hasHhvm })
  }
}
