import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { optionalUrl, nonNegativeInteger } from '../validators.js'
import { BaseJsonService, NotFound, pathParam, queryParam } from '../index.js'

const schema = Joi.object({
  username: Joi.string().required(),
  followers_count: nonNegativeInteger,
})

const queryParamSchema = Joi.object({
  domain: Joi.string().optional(),
}).required()

const description = `
To find your user id, you can use [this tool](https://prouser123.me/misc/mastodon-userid-lookup.html).

Alternatively you can make a request to \`https://your.mastodon.server/.well-known/webfinger?resource=acct:<user>@<domain>\`

Failing that, you can also visit your profile page, where your user ID will be in the header in a tag like this: \`<link href='https://your.mastodon.server/api/salmon/<your-user-id>' rel='salmon'>\`
`

export default class MastodonFollow extends BaseJsonService {
  static category = 'social'

  static route = {
    base: 'mastodon/follow',
    pattern: ':id',
    queryParamSchema,
  }

  static openApi = {
    '/mastodon/follow/{id}': {
      get: {
        summary: 'Mastodon Follow',
        description,
        parameters: [
          pathParam({
            name: 'id',
            example: '26471',
          }),
          queryParam({
            name: 'domain',
            example: 'https://mastodon.social',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = {
    namedLogo: 'mastodon',
  }

  static render({ username, followers, domain }) {
    return {
      label: `follow @${username}`,
      message: metric(followers),
      style: 'social',
      link: [
        `${domain}/users/${username}`,
        `${domain}/users/${username}/followers`,
      ],
    }
  }

  async fetch({ id, domain }) {
    return this._requestJson({
      schema,
      url: `https://${domain}/api/v1/accounts/${id}/`,
    })
  }

  async handle({ id }, { domain = 'mastodon.social' }) {
    if (isNaN(id))
      throw new NotFound({ prettyMessage: 'invalid user id format' })
    if (domain.startsWith('https://')) {
      domain = domain.substring(8)
    } else if (domain.startsWith('http://')) {
      domain = domain.substring(7)
    }
    const data = await this.fetch({ id, domain })
    return this.constructor.render({
      username: data.username,
      followers: data.followers_count,
      domain,
    })
  }
}
