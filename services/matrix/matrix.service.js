'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')

const matrixRegisterSchema = Joi.object({
  access_token: Joi.string().required(),
}).required()

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
      <li>Scroll to the very bottom of the settings page and look under the <code>Advanced</code> tab</li>
      <li>You should see the <code>Internal room ID</code> with your rooms ID next to it (ex: <code>!ltIjvaLydYAWZyihee:matrix.org</code>)</li>
      <li>Replace the IDs <code>:</code> with <code>/</code></li>
      <li>The final badge URL should look something like this <code>/matrix/!ltIjvaLydYAWZyihee/matrix.org.svg</code></li>
    </ul>
  </p>
  `

module.exports = class Matrix extends BaseJsonService {
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

  async fetch({ host, roomId }) {
    let auth
    try {
      auth = await this.registerAccount({ host, guest: true })
    } catch (e) {
      if (e.prettyMessage === 'guests not allowed') {
        // attempt fallback method
        auth = await this.registerAccount({ host, guest: false })
      } else throw e
    }
    const data = await this._requestJson({
      url: `https://${host}/_matrix/client/r0/rooms/${roomId}/state`,
      schema: matrixStateSchema,
      options: {
        qs: {
          access_token: auth.access_token,
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

  async handle({ roomId, host, authServer }) {
    const members = await this.fetch({
      host,
      roomId: `${roomId}:${host}`,
    })
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
      format: '([^/]+)/([^/]+)',
      capture: ['roomId', 'host'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Matrix',
        exampleUrl: '!ltIjvaLydYAWZyihee/matrix.org',
        pattern: ':roomId/:host',
        staticExample: this.render({ members: 42 }),
        documentation,
      },
    ]
  }
}
