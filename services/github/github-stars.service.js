'use strict'

const Joi = require('@hapi/joi')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { GithubAuthV3Service } = require('./github-auth-service')
const { documentation, errorMessagesFor } = require('./github-helpers')

const schema = Joi.object({
  stargazers_count: nonNegativeInteger,
}).required()

module.exports = class GithubStars extends GithubAuthV3Service {
  static get category() {
    return 'social'
  }

  static get route() {
    return {
      base: 'github/stars',
      pattern: ':user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub stars',
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
  }

  static get defaultBadgeData() {
    return {
      label: 'stars',
      namedLogo: 'github',
    }
  }

  static render({ stars, user, repo }) {
    return {
      message: metric(stars),
      color: 'blue',
      link: [
        `https://github.com/${user}/${repo}`,
        `https://github.com/${user}/${repo}/stargazers`,
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
