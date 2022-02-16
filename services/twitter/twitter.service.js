import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { optionalUrl } from '../validators.js'
import { BaseService, BaseJsonService, NotFound } from '../index.js'

const queryParamSchema = Joi.object({
  url: optionalUrl.required(),
}).required()

class TwitterUrl extends BaseService {
  static category = 'social'

  static route = {
    base: 'twitter',
    pattern: 'url',
    queryParamSchema,
  }

  static examples = [
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

  static defaultBadgeData = {
    namedLogo: 'twitter',
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
  static category = 'social'

  static route = {
    base: 'twitter/follow',
    pattern: ':user',
  }

  static examples = [
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

  static defaultBadgeData = {
    namedLogo: 'twitter',
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
      options: { searchParams: { screen_names: user } },
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

export default [TwitterUrl, TwitterFollow]
