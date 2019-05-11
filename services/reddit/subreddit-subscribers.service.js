'use strict'

const { BaseJsonService } = require('..')
const Joi = require('joi')
const { nonNegativeInteger } = require('../validators')
const { metric } = require('../text-formatters')

const schema = Joi.object({ subscribers: nonNegativeInteger })

module.exports = class SubredditSubscribers extends BaseJsonService {
  static get category() {
    console.log('Category')
    return 'social'
  }

  static get route() {
    console.log('Route')
    return {
      base: 'reddit/subreddit-subscribers',
      pattern: ':subreddit',
    }
  }

  static get examples() {
    return [
      {
        title: 'Subreddit followers',
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
    console.log('Render')
    return {
      label: `follow r/${subreddit}`,
      message: metric(subscribers),
      style: 'flat',
      color: 'red',
      link: [`https://www.reddit.com/r/${subreddit}/`],
    }
  }

  async fetch({ subreddit }) {
    console.log('Fetch')
    return this._requestJson({
      schema,
      url: `https://www.reddit.com/r/${subreddit}/about.json`,
    })
  }

  async handle({ subreddit }) {
    console.log('Handle')
    const json = await this.fetch({ subreddit })
    return this.constructor.render({
      subreddit,
      subscribers: json.data.subscribers,
    })
  }
}
