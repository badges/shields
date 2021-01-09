'use strict'

const Joi = require('joi')
const { renderContributorBadgeWithLink } = require('../contributor-count')
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
      // TODO: This is currently a literal, as `staticPreview` doesn't
      // support `link`.
      staticPreview: {
        label: 'all contributors',
        message: '66',
        color: 'brightgreen',
      },
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'all contributors' }

  static render({ user, repo, contributorCount }) {
    const slug = `${encodeURIComponent(user)}/${encodeURIComponent(repo)}`
    const link = [
      `https://github.com/${slug}`,
      `https://github.com/${slug}/graphs/contributors`,
    ]
    return renderContributorBadgeWithLink({ contributorCount, link })
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
    return this.constructor.render({ user, repo, contributorCount })
  }
}
