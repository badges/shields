'use strict'

const dns = require('dns')
const util = require('util')
const Joi = require('joi')
const BaseJsonService = require('../base-json')
const errors = require('../errors')

const matrixRegisterSchema = Joi.object({
  access_token: Joi.string().required(),
}).required()

const matrixClientVersionsSchema = Joi.object({
  versions: Joi.array()
    .items(Joi.string().required())
    .required(),
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
      state_key: Joi.string()
        .allow('')
        .required(),
    })
  )
  .required()

const documentation = `
  <p>
    In order for this badge to work, the host of your room must allow guest accounts or dummy accounts to register, and the room must be world readable (chat history visible to anyone).
    </br>
    The following steps will show you how to setup the badge URL using the Riot.im Matrix client.
    </br>
    <ul>
      <li>Select the desired room inside the Riot.im client</li>
      <li>Click on the room settings button (gear icon) located near the top right of the client</li>
      <li>Scroll to the very bottom of the settings page and look under the <code>Addresses</code> section</li>
      <li>You should see one or more <code>room addresses (or aliases)</code>, which can be easily identified with their starting hash (<code>#</code>) character (ex: <code>#twim:matrix.org</code>)</li>
      <li>If there is no address for this room, add one under <code>Local addresses for this room</code></li>
      <li>Remove the starting hash character (<code>#</code>)</li>
      <li>The final badge URL should look something like this <code>/matrix/twim:matrix.org.svg</code></li>
    </ul>
  </p>
  `

const srvPrefix = '_matrix._tcp.'
const resolve = util.promisify(dns.resolveSrv)

const accessTokens = {}

module.exports = class Matrix extends BaseJsonService {
  async lookupMatrixHomeserver({ host }) {
    return resolve(srvPrefix + host)
  }

  async checkMatrixHomeserverClientAPI({ host }) {
    return this._requestJson({
      url: `https://${host}/_matrix/client/versions`,
      schema: matrixClientVersionsSchema,
    })
  }

  async retrieveAccessToken({ host }) {
    if (accessTokens[host] === undefined) {
      let auth
      try {
        auth = await this.registerAccount({ host, guest: true })
      } catch (e) {
        if (e.prettyMessage === 'guests not allowed') {
          // attempt fallback method
          auth = await this.registerAccount({ host, guest: false })
        } else throw e
      }

      accessTokens[host] = auth.access_token
    }

    return accessTokens[host]
  }

  async registerAccount({ host, guest }) {
    return this._requestJson({
      url: `https://${host}/_matrix/client/r0/register`,
      schema: matrixRegisterSchema,
      options: {
        method: 'POST',
        qs: guest
          ? {
              kind: 'guest',
            }
          : {},
        body: JSON.stringify({
          password: '',
          auth: { type: 'm.login.dummy' },
        }),
      },
      errorMessages: {
        401: 'auth failed',
        403: 'guests not allowed',
        429: 'rate limited by rooms host',
      },
    })
  }

  async lookupRoomAlias({ host, roomAlias, accessToken }) {
    return this._requestJson({
      url: `https://${host}/_matrix/client/r0/directory/room/%23${roomAlias}`,
      schema: matrixAliasLookupSchema,
      options: {
        qs: {
          access_token: accessToken,
        },
      },
      errorMessages: {
        401: 'auth failed',
        404: 'room not found',
        429: 'rate limited by rooms host',
      },
    })
  }

  async fetch({ roomAlias }) {
    const splitAlias = roomAlias.split(':')
    // A room alias can either be in the form #localpart:server or
    // #localpart:server:port. In the latter case, it's wiser to skip the name
    // resolution and use that value right away.
    if (splitAlias.length < 2 || splitAlias.length > 3) {
      throw new errors.InvalidParameter()
    }
    let host
    if (splitAlias.length === 2) {
      host = splitAlias[1]
      try {
        const addrs = await this.lookupMatrixHomeserver({ host })
        if (addrs.length) {
          // The address we are given may be only to use for federation.
          // Therefore we check if we can painlessly reach the client APIs at
          // this address, and if not we don't do anything, and ignore the
          // error, since host already holds the right value, and we expect this
          // check to fail in some cases.
          try {
            await this.checkMatrixHomeserverClientAPI({ host: addrs[0].name })
            host = addrs[0].name
          } catch (e) {}
        }
      } catch (e) {
        // If the error is ENOTFOUND, it means that there is no SRV record for
        // this server, and that we need to fall back on the value host already
        // holds.
        if (e.code !== 'ENOTFOUND') {
          throw e
        }
      }
    } else {
      host = splitAlias[2] + splitAlias[3]
    }
    const accessToken = await this.retrieveAccessToken({ host })
    const lookup = await this.lookupRoomAlias({ host, roomAlias, accessToken })
    const data = await this._requestJson({
      url: `https://${host}/_matrix/client/r0/rooms/${lookup.room_id}/state`,
      schema: matrixStateSchema,
      options: {
        qs: {
          access_token: accessToken,
        },
      },
      errorMessages: {
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
            m.content.membership === 'join'
        ).length
      : 0
  }

  static get _cacheLength() {
    return 30
  }

  static render({ members }) {
    return {
      message: `${members} users`,
      color: 'brightgreen',
    }
  }

  async handle({ roomAlias, authServer }) {
    const members = await this.fetch({ roomAlias })
    return this.constructor.render({ members })
  }

  static get defaultBadgeData() {
    return { label: 'chat' }
  }

  static get category() {
    return 'chat'
  }

  static get route() {
    return {
      base: 'matrix',
      format: '([^/]+)',
      capture: ['roomAlias'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Matrix',
        exampleUrl: 'twim:matrix.org',
        pattern: ':roomAlias',
        staticExample: this.render({ members: 42 }),
        documentation,
      },
    ]
  }
}
