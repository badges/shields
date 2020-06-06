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

  static render({ variant, karma, user }) {
    const label =
      variant === 'combined'
        ? `u/${user} karma`
        : `u/${user} karma (${variant})`
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

  transform({ json, variant }) {
    let karma
    if (variant === 'link') {
      karma = json.data.link_karma
    } else if (variant === 'comment') {
      karma = json.data.comment_karma
    } else {
      const total = json.data.link_karma + json.data.comment_karma
      karma = total
    }

    return { karma }
  }

  async handle({ variant, user }) {
    const json = await this.fetch({ user })
    const { karma } = this.transform({ json, variant })

    return this.constructor.render({
      variant,
      karma: `${karma}`,
      user,
    })
  }
}
