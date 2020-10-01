'use strict'

const Joi = require('joi')
const prettyBytes = require('pretty-bytes')
const { nonNegativeInteger } = require('../validators')
const { GithubAuthV3Service } = require('./github-auth-service')
const { documentation, errorMessagesFor } = require('./github-helpers')

const schema = Joi.object({
  size: nonNegativeInteger,
}).required()

module.exports = class GithubRepoSize extends GithubAuthV3Service {
  static category = 'size'
  static route = { base: 'github/repo-size', pattern: ':user/:repo' }
  static examples = [
    {
      title: 'GitHub repo size',
      namedParams: {
        user: 'atom',
        repo: 'atom',
      },
      staticPreview: this.render({ size: 319488 }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'repo size' }

  static render({ size }) {
    return {
      // note the GH API returns size in Kb
      message: prettyBytes(size * 1024),
      color: 'blue',
    }
  }

  async fetch({ user, repo }) {
    return this._requestJson({
      url: `/repos/${user}/${repo}`,
      schema,
      errorMessages: errorMessagesFor(),
    })
  }

  async handle({ user, repo }) {
    const { size } = await this.fetch({ user, repo })
    return this.constructor.render({ size })
  }
}
