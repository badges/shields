import Joi from 'joi'
import { optionalNonNegativeInteger } from '../validators.js'
import { metric } from '../text-formatters.js'
import { NotFound, pathParams } from '../index.js'
import RedditBase from './reddit-base.js'

const schema = Joi.object({
  data: Joi.object({
    subscribers: optionalNonNegativeInteger,
  }).required(),
}).required()

export default class RedditSubredditSubscribers extends RedditBase {
  static route = {
    base: 'reddit/subreddit-subscribers',
    pattern: ':subreddit',
  }

  static openApi = {
    '/reddit/subreddit-subscribers/{subreddit}': {
      get: {
        summary: 'Subreddit subscribers',
        parameters: pathParams({
          name: 'subreddit',
          example: 'drums',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'reddit',
    namedLogo: 'reddit',
  }

  static render({ subreddit, subscribers }) {
    return {
      label: `follow r/${subreddit}`,
      message: metric(subscribers),
      style: 'social',
      color: 'red',
      link: [`https://www.reddit.com/r/${subreddit}`],
    }
  }

  async fetch({ subreddit }) {
    return this._requestJson({
      schema,
      // API requests with a bearer token should be made to https://oauth.reddit.com, NOT www.reddit.com.
      url: this.authHelper.isConfigured
        ? `https://oauth.reddit.com/r/${subreddit}/about.json`
        : `https://www.reddit.com/r/${subreddit}/about.json`,
      httpErrors: {
        404: 'subreddit not found',
        403: 'subreddit is private',
      },
    })
  }

  transform(json) {
    const subscribers = json.data.subscribers
    if (subscribers === undefined) {
      throw new NotFound({ prettyMessage: 'subreddit not found' })
    }
    return { subscribers }
  }

  async handle({ subreddit }) {
    const json = await this.fetch({ subreddit })
    const { subscribers } = this.transform(json)
    return this.constructor.render({
      subreddit,
      subscribers,
    })
  }
}
