'use strict'

const Joi = require('@hapi/joi')
const { metric } = require('../text-formatters')
const { optionalUrl } = require('../validators')
const { BaseService, BaseJsonService, NotFound } = require('..')

const queryParamSchema = Joi.object({
  url: optionalUrl.required(),
}).required()

class TwitterUrl extends BaseService {
  static get category() {
    return 'social'
  }

  static get route() {
    return {
      base: 'twitter',
      pattern: 'url',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'Twitter URL',
        namedParams: {},
        queryParams: {
          url: 'https://shields.io',
        },
        // hard code the static preview
        // because link[] is not allowed in examples
        staticPreview: {
          label: 'Tweet',
          message: '',
          style: 'social',
        },
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      namedLogo: 'twitter',
    }
  }

  async handle(_routeParams, { url }) {
    const page = encodeURIComponent(`${url}`)
    return {
      label: 'tweet',
      message: '',
      style: 'social',
      link: [
        `https://twitter.com/intent/tweet?text=Wow:&url=${page}`,
        `https://twitter.com/search?q=${page}`,
      ],
    }
  }
}

const schema = Joi.any()

class TwitterFollow extends BaseJsonService {
  static get category() {
    return 'social'
  }

  static get route() {
    return {
      base: 'twitter/follow',
      pattern: ':user',
    }
  }

  static get examples() {
    return [
      {
        title: 'Twitter Follow',
        namedParams: {
          user: 'espadrine',
        },
        queryParams: { label: 'Follow' },
        // hard code the static preview
        // because link[] is not allowed in examples
        staticPreview: {
          label: 'Follow',
          message: '393',
          style: 'social',
        },
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      namedLogo: 'twitter',
    }
  }

  static render({ user, followers }) {
    return {
      label: `follow @${user}`,
      message: metric(followers),
      style: 'social',
      link: [
        `https://twitter.com/intent/follow?screen_name=${encodeURIComponent(
          user
        )}`,
        `https://twitter.com/${encodeURIComponent(user)}/followers`,
      ],
    }
  }

  async fetch({ user }) {
    return this._requestJson({
      schema,
      url: `http://cdn.syndication.twimg.com/widgets/followbutton/info.json`,
      options: { qs: { screen_names: user } },
    })
  }

  async handle({ user }) {
    const data = await this.fetch({ user })
    if (!Array.isArray(data) || data.length === 0) {
      throw new NotFound({ prettyMessage: 'invalid user' })
    }
    return this.constructor.render({ user, followers: data[0].followers_count })
  }
}

module.exports = [TwitterUrl, TwitterFollow]
