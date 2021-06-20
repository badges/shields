import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { optionalUrl, nonNegativeInteger } from '../validators.js'
import { BaseJsonService, NotFound } from '../index.js'

const schema = Joi.object({
  username: Joi.string().required(),
  followers_count: nonNegativeInteger,
})

const queryParamSchema = Joi.object({
  domain: optionalUrl,
}).required()

const documentation = `
<p>To find your user id, you can use <a link target="_blank" href="https://prouser123.me/misc/mastodon-userid-lookup.html">this tool</a>.</p><br>
<p>Alternatively you can make a request to <code><br>https://your.mastodon.server/.well-known/webfinger?resource=acct:{user}@{domain}</br></code></p>
<p>Failing that, you can also visit your profile page, where your user ID will be in the header in a tag like this: <code>&lt;link href='https://your.mastodon.server/api/salmon/{your-user-id}' rel='salmon'></code></p>
`

export default class MastodonFollow extends BaseJsonService {
  static category = 'social'

  static route = {
    base: 'mastodon/follow',
    pattern: ':id',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Mastodon Follow',
      namedParams: {
        id: '26471',
      },
      queryParams: { domain: 'https://mastodon.social' },
      staticPreview: {
        label: 'Follow',
        message: '862',
        style: 'social',
      },
      documentation,
    },
  ]

  static defaultBadgeData = {
    namedLogo: 'mastodon',
  }

  static render({ username, followers, domain }) {
    return {
      label: `follow @${username}`,
      message: metric(followers),
      style: 'social',
      link: [
        `${domain}/users/${username}/remote_follow`,
        `${domain}/users/${username}/followers`,
      ],
    }
  }

  async fetch({ id, domain }) {
    return this._requestJson({
      schema,
      url: `${domain}/api/v1/accounts/${id}/`,
    })
  }

  async handle({ id }, { domain = 'https://mastodon.social' }) {
    if (isNaN(id))
      throw new NotFound({ prettyMessage: 'invalid user id format' })
    const data = await this.fetch({ id, domain })
    return this.constructor.render({
      username: data.username,
      followers: data.followers_count,
      domain,
    })
  }
}
