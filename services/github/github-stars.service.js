'use strict'

const Joi = require('joi')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { GithubAuthV3Service } = require('./github-auth-service')
const { documentation, errorMessagesFor } = require('./github-helpers')

const schema = Joi.object({
  stargazers_count: nonNegativeInteger,
}).required()

module.exports = class GithubStars extends GithubAuthV3Service {
  static category = 'social'

  static route = {
    base: 'github/stars',
    pattern: ':user/:repo',
  }

  static examples = [
    {
      title: 'GitHub Repo stars',
      namedParams: {
        user: 'badges',
        repo: 'shields',
      },
      queryParams: { style: 'social' },
      // TODO: This is currently a literal, as `staticPreview` doesn't
      // support `link`.
      staticPreview: {
        label: 'Stars',
        message: '7k',
        style: 'social',
      },
      documentation,
    },
  ]

  static defaultBadgeData = {
    label: 'stars',
    namedLogo: 'github',
  }

  static render({ stars, user, repo }) {
    const slug = `${encodeURIComponent(user)}/${encodeURIComponent(repo)}`
    return {
      message: metric(stars),
      color: 'blue',
      link: [
        `https://github.com/${slug}`,
        `https://github.com/${slug}/stargazers`,
      ],
    }
  }

  async handle({ user, repo }) {
    const { stargazers_count: stars } = await this._requestJson({
      url: `/repos/${user}/${repo}`,
      schema,
      errorMessages: errorMessagesFor(),
    })
    return this.constructor.render({ user, repo, stars })
  }
}
