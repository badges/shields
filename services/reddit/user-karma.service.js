'use strict'

const Joi = require('@hapi/joi')
const { nonNegativeInteger } = require('../validators')
const { metric } = require('../text-formatters')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  data: Joi.object({
    link_karma: nonNegativeInteger,
    comment_karma: nonNegativeInteger,
  }).required(),
}).required()

module.exports = class RedditUserKarma extends BaseJsonService {
  static get category() {
    return 'social'
  }

  static get route() {
    return {
      base: 'reddit/user-karma',
      pattern: ':variant(link|comment|combined)/:user',
    }
  }

  static get examples() {
    return [
      {
        title: 'Reddit User Karma',
        namedParams: { variant: 'combined', user: 'example' },
        staticPreview: {
          label: 'combined karma',
          message: 56,
          color: 'red',
          style: 'social',
        },
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'reddit karma',
      namedLogo: 'reddit',
    }
  }

  static render({ label, karma, user }) {
    return {
      label: `${label}`,
      message: metric(karma),
      color: 'red',
      link: [`https://www.reddit.com/u/${user}`],
    }
  }

  async fetch({ user }) {
    return this._requestJson({
      schema,
      url: `https://www.reddit.com/u/${user}/about.json`,
      errorMessages: {
        404: 'user not found',
      },
    })
  }

  async handle({ variant, user }) {
    const json = await this.fetch({ user })

    let karma
    let label
    if (variant === 'link') {
      karma = json.data.link_karma
      label = `${user}'s karma (link)`
    } else if (variant === 'comment') {
      karma = json.data.comment_karma
      label = `${user}'s karma (comment)`
    } else {
      const total = json.data.link_karma + json.data.comment_karma
      karma = total
      label = `${user}'s karma`
    }

    return this.constructor.render({
      label: `${label}`,
      karma: `${karma}`,
      user: 'izzyanut',
    })
  }
}
