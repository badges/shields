'use strict'

const Joi = require('@hapi/joi')
const { metric } = require('../text-formatters')
const { BaseJsonService } = require('..')

const instagramSchema = Joi.object({
  graphql: Joi.object({
    user: Joi.object({
      edge_followed_by: Joi.object({
        count: Joi.number()
          .positive()
          .required(),
      }).required(),
    }).required(),
  }).required(),
}).required()

module.exports = class InstagramFollow extends BaseJsonService {
  static get category() {
    return 'social'
  }

  static get route() {
    return {
      base: 'instagram/follow',
      pattern: ':user',
    }
  }

  static get examples() {
    return [
      {
        title: 'Instagram Follow',
        namedParams: {
          user: 'instagram',
        },
        queryParams: { label: 'Follow' },
        // hard code the static preview
        // because link[] is not allowed in examples
        staticPreview: {
          label: 'Follow',
          message: '316.1M',
          style: 'social',
        },
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      namedLogo: 'instagram',
    }
  }

  static render({ user, followers }) {
    return {
      label: `follow @${user}`,
      message: metric(followers),
      style: 'social',
      link: [`https://www.instagram.com/${encodeURIComponent(user)}`],
    }
  }

  async fetch({ user }) {
    return this._requestJson({
      schema: instagramSchema,
      url: `https://www.instagram.com/${encodeURIComponent(user)}`,
      options: { qs: { __a: 1 } },
      errorMessages: {
        404: 'user not found',
      },
    })
  }

  async handle({ user }) {
    const json = await this.fetch({ user })
    return this.constructor.render({
      user,
      followers: json.graphql.user.edge_followed_by.count,
    })
  }
}
