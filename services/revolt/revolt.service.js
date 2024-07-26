import Joi from 'joi'
import { BaseJsonService, pathParam, queryParam } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger, optionalUrl } from '../validators.js'

const schema = Joi.object({
  member_count: nonNegativeInteger,
}).required()

const description = `
The Revolt badge requires an <code>INVITE CODE</code> to access the Revolt API,
which can be located at the end of the invitation url.

For example, both
<code>https://app.revolt.chat/invite/01F7ZSBSFHQ8TA81725KQCSDDP</code> and
<code>https://rvlt.gg/01F7ZSBSFHQ8TA81725KQCSDDP</code> contains an invite code
of <code>01F7ZSBSFHQ8TA81725KQCSDDP</code>.
`

const queryParamSchema = Joi.object({
  revolt_api_url: optionalUrl,
}).required()

export default class RevoltServerInvite extends BaseJsonService {
  static category = 'chat'

  static route = {
    base: 'revolt/invite',
    pattern: ':inviteId',
    queryParamSchema,
  }

  static openApi = {
    '/revolt/invite/{inviteId}': {
      get: {
        summary: 'Revolt',
        description,
        parameters: [
          pathParam({
            name: 'inviteId',
            example: '01F7ZSBSFHQ8TA81725KQCSDDP',
          }),
          queryParam({
            name: 'revolt_api_url',
            example: 'https://api.revolt.chat',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'chat' }

  static render({ memberCount }) {
    return {
      message: `${metric(memberCount)} members`,
      color: 'brightgreen',
    }
  }

  async fetch({ inviteId, baseUrl }) {
    return this._requestJson({
      schema,
      url: `${baseUrl}/invites/${inviteId}`,
    })
  }

  async handle(
    { inviteId },
    { revolt_api_url: baseUrl = 'https://api.revolt.chat' },
  ) {
    const { member_count: memberCount } = await this.fetch({
      inviteId,
      baseUrl,
    })
    return this.constructor.render({
      memberCount,
    })
  }
}
