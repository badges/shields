import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { BaseJsonService, InvalidParameter } from '../index.js'

const queryParamSchema = Joi.object({
  server_fqdn: Joi.string().hostname(),
}).required()

const lemmyCommunitySchema = Joi.object({
  community_view: Joi.object({
    counts: Joi.object({
      subscribers: Joi.number().required(),
      posts: Joi.number().required(),
      comments: Joi.number().required(),
    }).required(),
  }).required(),
}).required()

export default class Lemmy extends BaseJsonService {
  static category = 'social'

  static route = {
    base: 'lemmy',
    pattern: ':community',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Lemmy',
      namedParams: { community: 'asklemmy@lemmy.ml' },
      staticPreview: this.render({
        community: 'asklemmy@lemmy.ml',
        members: 42,
      }),
    },
    {
      title: 'Lemmy',
      namedParams: { community: 'asklemmy@lemmy.ml' },
      queryParams: { server_fqdn: 'lemmy.world' },
      staticPreview: this.render({
        community: 'asklemmy@lemmy.ml',
        members: 42,
      }),
    },
  ]

  static _cacheLength = 30

  static defaultBadgeData = { label: 'community' }

  static render({ community, members }) {
    return {
      label: `subscribe to ${community}`,
      message: `${metric(members)} subscribers`,
      color: 'brightgreen',
    }
  }

  async fetch({ community, serverFQDN }) {
    let host
    if (serverFQDN === undefined) {
      const splitAlias = community.split('@')
      // The community will be in the format of `community@server`
      if (splitAlias.length !== 2) {
        throw new InvalidParameter({
          prettyMessage: 'invalid community',
        })
      }

      host = splitAlias[1]
    } else {
      host = serverFQDN
    }
    const data = await this._requestJson({
      url: `https://${host}/api/v3/community`,
      schema: lemmyCommunitySchema,
      options: {
        searchParams: {
          name: community,
        },
      },
      httpErrors: {
        404: 'community not found',
      },
    })
    return data.community_view.counts.subscribers
  }

  async handle({ community }, { server_fqdn: serverFQDN }) {
    const members = await this.fetch({ community, serverFQDN })
    return this.constructor.render({ community, members })
  }
}
