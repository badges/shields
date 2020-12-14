'use strict'

const Joi = require('joi')
const { renderContributorBadge } = require('../contributor-count')
const { ConditionalGithubAuthV3Service } = require('./github-auth-service')
const { fetchJsonFromRepo } = require('./github-common-fetch')
const { documentation } = require('./github-helpers')

const schema = Joi.object({
  contributors: Joi.array().required(),
}).required()

module.exports = class GithubAllContributorsService extends (
  ConditionalGithubAuthV3Service
) {
  static category = 'activity'
  static route = {
    base: 'github/all-contributors',
    pattern: ':user/:repo/:branch*',
  }

  static examples = [
    {
      title: 'Github All Contributors',
      namedParams: {
        repo: 'all-contributors',
        user: 'all-contributors',
        branch: 'master',
      },
      staticPreview: this.render({ contributorCount: 66 }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'all contributors' }

  static render({ contributorCount }) {
    return renderContributorBadge({ contributorCount })
  }

  async handle({ user, repo, branch }) {
    const { contributors } = await fetchJsonFromRepo(this, {
      schema,
      user,
      repo,
      branch,
      filename: '.all-contributorsrc',
    })

    const contributorCount = contributors.length
    return this.constructor.render({ contributorCount })
  }
}
