'use strict'

const Joi = require('joi')
const { renderVersionBadge } = require('../version')
const { semver } = require('../validators')
const { ConditionalGithubAuthV3Service } = require('./github-auth-service')
const { fetchJsonFromRepo } = require('./github-common-fetch')
const { documentation } = require('./github-helpers')

const versionSchema = Joi.object({
  version: Joi.alternatives().try(semver, Joi.equal('independent').required()),
}).required()

module.exports = class GithubLernaJson extends ConditionalGithubAuthV3Service {
  static category = 'version'
  static route = {
    base: 'github/lerna-json/v',
    pattern: ':user/:repo/:branch*',
  }

  static examples = [
    {
      title: 'Github lerna version',
      pattern: ':user/:repo',
      namedParams: { user: 'babel', repo: 'babel' },
      staticPreview: this.render({ version: '7.6.4' }),
      documentation,
    },
    {
      title: 'Github lerna version (branch)',
      pattern: ':user/:repo/:branch',
      namedParams: { user: 'jneander', repo: 'jneander', branch: 'colors' },
      staticPreview: this.render({
        version: 'independent',
        branch: 'colors',
      }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'lerna' }

  static render({ version, branch }) {
    return renderVersionBadge({
      version,
      tag: branch,
      defaultLabel: 'lerna',
    })
  }

  async handle({ user, repo, branch }) {
    const { version } = await fetchJsonFromRepo(this, {
      schema: versionSchema,
      user,
      repo,
      branch,
      filename: 'lerna.json',
    })
    return this.constructor.render({ version, branch })
  }
}
