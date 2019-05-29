'use strict'

const Joi = require('joi')
const { BaseJsonService, NotFound } = require('..')
const { metric } = require('../text-formatters')
const { optionalUrl } = require('../validators')

const schema = Joi.object({
  username: Joi.string().required(),
  followers_count: Joi.number().required(),
})

const queryParamSchema = Joi.object({
  domain: optionalUrl,
}).required()

module.exports = class MastodonFollow extends BaseJsonService {
  static get category() {
    return 'social'
  }

  static get route() {
    return {
      base: 'mastodon/follow',
      pattern: ':id',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'Mastodon Follow',
        namedParams: {
          id: '26471',
        },
        queryParams: { domain: 'https://mastodon.social' },
        staticPreview: {
          label: 'Follow',
          message: '862',
          style: 'social',
        },
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      namedLogo: 'mastodon',
    }
  }

  static render({ username, followers, domain }) {
    return {
      label: `follow @${username}`,
      message: metric(followers),
      style: 'social',
      link: [
        `${domain}/users/${username}/remote_follow`,
        `${domain}/users/${username}/followers`,
      ],
    }
  }

  async fetch({ id, domain }) {
    return this._requestJson({
      schema,
      url: `${domain}/api/v1/accounts/${id}/`,
    })
  }

  async handle({ id }, { domain = 'https://mastodon.social' }) {
    if (isNaN(id))
      throw new NotFound({ prettyMessage: 'invalid user id format' })
    const data = await this.fetch({ id, domain })
    return this.constructor.render({
      username: data.username,
      followers: data.followers_count,
      domain,
    })
  }
}
