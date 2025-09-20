import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, NotFound, pathParam, queryParam } from '../index.js'

const schema = Joi.object({
  username: Joi.string().required(),
  followers_count: nonNegativeInteger,
})

const queryParamSchema = Joi.object({
  domain: Joi.string().optional(),
}).required()

const description = `
To find your user id, you can make a request to \`https://your.mastodon.server/api/v1/accounts/lookup?acct=yourusername\`.
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
            example: 'mastodon.social',
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
        `https://${domain}/users/${username}`,
        `https://${domain}/users/${username}/followers`,
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
    domain = domain.replace(/^https?:\/\//, '')
    const data = await this.fetch({ id, domain })
    return this.constructor.render({
      username: data.username,
      followers: data.followers_count,
      domain,
    })
  }
}
