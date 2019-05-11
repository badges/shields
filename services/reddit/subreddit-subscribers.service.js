'use strict'

const { BaseJsonService } = require('..')
const Joi = require('joi')
const { nonNegativeInteger } = require('../validators')
const { metric } = require('../text-formatters')

const schema = Joi.object({ subscribers: nonNegativeInteger })

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
        staticPreview: this.render({ subreddit: 'drums', subscribers: 14500 }),
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'defaultBadge',
    }
  }

  static render({ subreddit, subscribers }) {
    return {
      label: `follow r/${subreddit}`,
      message: metric(subscribers),
      color: 'red',
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
