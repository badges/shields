'use strict'

const Joi = require('joi')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { GithubAuthService } = require('./github-auth-service')
const { documentation, errorMessagesFor } = require('./github-helpers')

const schema = Joi.object({
  followers: nonNegativeInteger,
}).required()

module.exports = class GithubFollowers extends GithubAuthService {
  static get category() {
    return 'social'
  }

  static get route() {
    return {
      base: 'github/followers',
      pattern: ':user',
    }
  }

  static render({ followers }) {
    return {
      message: metric(followers),
      color: '4183C4',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub followers',
        namedParams: { user: 'espadrine' },
        staticPreview: Object.assign(this.render({ followers: 150 }), {
          label: 'Follow',
        }),
        queryParams: { label: 'Follow' },
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'followers',
      namedLogo: 'github',
    }
  }

  async handle({ user }) {
    const { followers } = await this._requestJson({
      url: `/users/${user}`,
      schema,
      errorMessages: errorMessagesFor('user not found'),
    })
    return this.constructor.render({ followers })
  }
}
