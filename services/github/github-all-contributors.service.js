'use strict'

const Joi = require('@hapi/joi')
const { renderContributorBadge } = require('../contributor-count')
const { ConditionalGithubAuthV3Service } = require('./github-auth-service')
const { fetchJsonFromRepo } = require('./github-common-fetch')
const { documentation } = require('./github-helpers')

const schema = Joi.object({
  contributors: Joi.array(),
}).required()

module.exports = class GithubAllContributorsService extends ConditionalGithubAuthV3Service {
  static get category() {
    return 'activity'
  }

  static get route() {
    return {
      base: 'github/all-contributors',
      pattern: ':user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'Github All Contributors',
        namedParams: {
          repo: 'all-contributors',
          user: 'all-contributors',
        },
        staticPreview: this.render({ contributorCount: 66 }),
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'all contributors' }
  }

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
