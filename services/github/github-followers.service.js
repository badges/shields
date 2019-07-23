'use strict'

const Joi = require('@hapi/joi')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { GithubAuthV3Service } = require('./github-auth-service')
const { documentation, errorMessagesFor } = require('./github-helpers')

const schema = Joi.object({
  followers: nonNegativeInteger,
}).required()

module.exports = class GithubFollowers extends GithubAuthV3Service {
  static get category() {
    return 'social'
  }

  static get route() {
    return {
      base: 'github/followers',
      pattern: ':user',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub followers',
        namedParams: { user: 'espadrine' },
        staticPreview: Object.assign(this.render({ followers: 150 }), {
          label: 'Follow',
          style: 'social',
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

  static render({ followers }) {
    return {
      message: metric(followers),
      color: '4183C4',
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
