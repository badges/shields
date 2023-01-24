import Joi from 'joi'
import { optionalUrl } from '../validators.js'
import { BaseService, BaseJsonService } from '../index.js'

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

  static _cacheLength = 86400

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

/*
This badge is unusual.

We don't usually host badges that don't show any dynamic information.
Also when an upstream API is removed, we usually deprecate/remove badges
according to the process in
https://github.com/badges/shields/blob/master/doc/deprecating-badges.md

In the case of twitter, we decided to provide a static fallback instead
due to how widely used the badge was. See
https://github.com/badges/shields/issues/8837
for related discussion.
*/
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
        user: 'shields_io',
      },
      queryParams: { label: 'Follow' },
      // hard code the static preview
      // because link[] is not allowed in examples
      staticPreview: {
        label: 'Follow @shields_io',
        message: '',
        style: 'social',
      },
    },
  ]

  static _cacheLength = 86400

  static defaultBadgeData = {
    namedLogo: 'twitter',
  }

  static render({ user }) {
    return {
      label: `follow @${user}`,
      message: '',
      style: 'social',
      link: [
        `https://twitter.com/intent/follow?screen_name=${encodeURIComponent(
          user
        )}`,
      ],
    }
  }

  async handle({ user }) {
    return this.constructor.render({ user })
  }
}

export default [TwitterUrl, TwitterFollow]
