'use strict'

const Joi = require('@hapi/joi')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { GithubAuthV3Service } = require('./github-auth-service')
const { errorMessagesFor, documentation } = require('./github-helpers')

const schema = Joi.object({ total_count: nonNegativeInteger }).required()

module.exports = class GithubSearch extends GithubAuthV3Service {
  static get category() {
    return 'analysis'
  }

  static get route() {
    return {
      base: 'github/search',
      pattern: ':user/:repo/:query+',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub search hit counter',
        pattern: ':user/:repo/:query',
        namedParams: {
          user: 'torvalds',
          repo: 'linux',
          query: 'goto',
        },
        staticPreview: this.render({ query: 'goto', totalCount: 14000 }),
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'counter',
    }
  }

  static render({ query, totalCount }) {
    return {
      label: `${query} counter`,
      message: metric(totalCount),
      color: 'blue',
    }
  }

  async handle({ user, repo, query }) {
    const { total_count: totalCount } = await this._requestJson({
      url: '/search/code',
      options: {
        qs: {
          q: `${query} repo:${user}/${repo}`,
        },
      },
      schema,
      errorMessages: errorMessagesFor('repo not found'),
    })
    return this.constructor.render({ query, totalCount })
  }
}
