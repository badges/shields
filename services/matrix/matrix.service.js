import Joi from 'joi'
import {
  BaseJsonService,
  InvalidParameter,
  pathParam,
  queryParam,
} from '../index.js'

const queryParamSchema = Joi.object({
  server_fqdn: Joi.string().hostname(),
}).required()

const matrixRegisterSchema = Joi.object({
  access_token: Joi.string().required(),
}).required()

const matrixAliasLookupSchema = Joi.object({
  room_id: Joi.string().required(),
})

const matrixStateSchema = Joi.array()
  .items(
    Joi.object({
      content: Joi.object({
        membership: Joi.string().optional(),
      }).required(),
      type: Joi.string().required(),
      sender: Joi.string().required(),
      state_key: Joi.string().allow('').required(),
    }),
  )
  .required()

const description = `
In order for this badge to work, the host of your room must allow guest accounts or dummy accounts to register, and the room must be world readable (chat history visible to anyone).

The following steps will show you how to setup the badge URL using the Element Matrix client.

<ul>
  <li>Select the desired room inside the Element client</li>
  <li>Click on the room settings button (gear icon) located near the top right of the client</li>
  <li>Scroll to the very bottom of the settings page and look under the <code>Addresses</code> section</li>
  <li>You should see one or more <code>room addresses (or aliases)</code>, which can be easily identified with their starting hash (<code>#</code>) character (ex: <code>#twim:matrix.org</code>)</li>
  <li>If there is no address for this room, add one under <code>Local addresses for this room</code></li>
  <li>Remove the starting hash character (<code>#</code>)</li>
  <li>The final badge URL should look something like this <code>/matrix/twim:matrix.org.svg</code></li>
</ul>

Some Matrix homeservers don't hold a server name matching where they live (e.g. if the homeserver <code>example.com</code> that created the room alias <code>#mysuperroom:example.com</code> lives at <code>matrix.example.com</code>).

If that is the case of the homeserver that created the room alias used for generating the badge, you will need to add the server's FQDN (fully qualified domain name) as a query parameter.

The final badge URL should then look something like this <code>/matrix/mysuperroom:example.com.svg?server_fqdn=matrix.example.com</code>.
`

export default class Matrix extends BaseJsonService {
  static category = 'chat'

  static route = {
    base: 'matrix',
    pattern: ':roomAlias',
    queryParamSchema,
  }

  static openApi = {
    '/matrix/{roomAlias}': {
      get: {
        summary: 'Matrix',
        description,
        parameters: [
          pathParam({
            name: 'roomAlias',
            example: 'twim:matrix.org',
          }),
          queryParam({
            name: 'server_fqdn',
            example: 'matrix.org',
          }),
        ],
      },
    },
  }

  static _cacheLength = 14400

  static defaultBadgeData = { label: 'chat' }

  static render({ members }) {
    return {
      message: `${members} users`,
      color: 'brightgreen',
    }
  }

  async retrieveAccessToken({ host }) {
    let auth
    try {
      auth = await this.registerAccount({ host, guest: true })
    } catch (e) {
      if (e.prettyMessage === 'guests not allowed') {
        // attempt fallback method
        auth = await this.registerAccount({ host, guest: false })
      } else throw e
    }

    return auth.access_token
  }

  async registerAccount({ host, guest }) {
    return this._requestJson({
      url: `https://${host}/_matrix/client/r0/register`,
      schema: matrixRegisterSchema,
      options: {
        method: 'POST',
        searchParams: guest
          ? {
              kind: 'guest',
            }
          : {},
        body: JSON.stringify({
          password: '',
          auth: { type: 'm.login.dummy' },
        }),
      },
      httpErrors: {
        401: 'auth failed',
        403: 'guests not allowed',
      },
    })
  }

  async lookupRoomAlias({ host, roomAlias, accessToken }) {
    return this._requestJson({
      url: `https://${host}/_matrix/client/r0/directory/room/${encodeURIComponent(
        `#${roomAlias}`,
      )}`,
      schema: matrixAliasLookupSchema,
      options: {
        searchParams: {
          access_token: accessToken,
        },
      },
      httpErrors: {
        401: 'bad auth token',
        404: 'room not found',
      },
    })
  }

  async fetch({ roomAlias, serverFQDN }) {
    let host
    if (serverFQDN === undefined) {
      const splitAlias = roomAlias.split(':')
      // A room alias can either be in the form #localpart:server or
      // #localpart:server:port.
      switch (splitAlias.length) {
        case 2:
          host = splitAlias[1]
          break
        case 3:
          host = `${splitAlias[1]}:${splitAlias[2]}`
          break
        default:
          throw new InvalidParameter({ prettyMessage: 'invalid alias' })
      }
    } else {
      host = serverFQDN
    }
    const accessToken = await this.retrieveAccessToken({ host })
    const lookup = await this.lookupRoomAlias({ host, roomAlias, accessToken })
    const data = await this._requestJson({
      url: `https://${host}/_matrix/client/r0/rooms/${encodeURIComponent(
        lookup.room_id,
      )}/state`,
      schema: matrixStateSchema,
      options: {
        searchParams: {
          access_token: accessToken,
        },
      },
      httpErrors: {
        400: 'unknown request',
        401: 'bad auth token',
        403: 'room not world readable or is invalid',
      },
    })
    return Array.isArray(data)
      ? data.filter(
          m =>
            m.type === 'm.room.member' &&
            m.sender === m.state_key &&
            m.content.membership === 'join',
        ).length
      : 0
  }

  async handle({ roomAlias }, { server_fqdn: serverFQDN }) {
    const members = await this.fetch({ roomAlias, serverFQDN })
    return this.constructor.render({ members })
  }
}
