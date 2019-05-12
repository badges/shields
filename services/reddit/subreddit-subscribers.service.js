'use strict'

const { BaseJsonService } = require('..')
const Joi = require('joi')
const { nonNegativeInteger } = require('../validators')
const { metric } = require('../text-formatters')

const schema = Joi.object({
  data: Joi.object({
    subscribers: nonNegativeInteger,
  }).required(),
}).required()

module.exports = class SubredditSubscribers extends BaseJsonService {
  static get category() {
    return 'social'
  }

  static get route() {
    return {
      base: 'reddit/subreddit-subscribers',
      pattern: ':subreddit',
    }
  }

  static get examples() {
    return [
      {
        title: 'Subreddit subscribers',
        namedParams: { subreddit: 'drums' },
        staticPreview: {
          label: 'follow r/drums',
          message: '77k',
          color: 'red',
          style: 'social',
        },
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'reddit',
    }
  }

  static render({ subreddit, subscribers }) {
    return {
      label: `follow r/${subreddit}`,
      message: metric(subscribers),
      color: 'red',
      link: [`https://www.reddit.com/r/${subreddit}`],
    }
  }

  async fetch({ subreddit }) {
    return this._requestJson({
      schema,
      url: `https://www.reddit.com/r/${subreddit}/about.json`,
    })
  }

  async handle({ subreddit }) {
    const json = await this.fetch({ subreddit })
    return this.constructor.render({
      subreddit,
      subscribers: json.data.subscribers,
    })
  }
}
