import Joi from 'joi'
import { url } from '../validators.js'
import { BaseService, pathParams, queryParams } from '../index.js'

const queryParamSchema = Joi.object({
  url,
}).required()

class TwitterUrl extends BaseService {
  static category = 'social'

  static route = {
    base: 'twitter',
    pattern: 'url',
    queryParamSchema,
  }

  static openApi = {
    '/twitter/url': {
      get: {
        summary: 'X (formerly Twitter) URL',
        parameters: queryParams({
          name: 'url',
          example: 'https://shields.io',
          required: true,
        }),
      },
    },
  }

  static _cacheLength = 86400

  static defaultBadgeData = {
    namedLogo: 'x',
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
class TwitterFollow extends BaseService {
  static category = 'social'

  static route = {
    base: 'twitter/follow',
    pattern: ':user',
  }

  static openApi = {
    '/twitter/follow/{user}': {
      get: {
        summary: 'X (formerly Twitter) Follow',
        parameters: pathParams({ name: 'user', example: 'shields_io' }),
      },
    },
  }

  static _cacheLength = 86400

  static defaultBadgeData = {
    namedLogo: 'x',
  }

  static render({ user }) {
    return {
      label: `follow @${user}`,
      message: '',
      style: 'social',
      link: [
        `https://twitter.com/intent/follow?screen_name=${encodeURIComponent(
          user,
        )}`,
      ],
    }
  }

  async handle({ user }) {
    return this.constructor.render({ user })
  }
}

export default [TwitterUrl, TwitterFollow]
