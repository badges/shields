import Joi from 'joi'
import { optionalNonNegativeInteger } from '../validators.js'
import { metric } from '../text-formatters.js'
import { BaseJsonService, NotFound } from '../index.js'

const schema = Joi.object({
  data: Joi.object({
    subscribers: optionalNonNegativeInteger,
  }).required(),
}).required()

export default class RedditSubredditSubscribers extends BaseJsonService {
  static category = 'social'

  static route = {
    base: 'reddit/subreddit-subscribers',
    pattern: ':subreddit',
  }

  static examples = [
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

  static defaultBadgeData = {
    label: 'reddit',
    namedLogo: 'reddit',
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
      errorMessages: {
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
