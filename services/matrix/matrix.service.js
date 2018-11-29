'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')

const matrixRegisterSchema = Joi.object({
  access_token: Joi.string().required(),
}).required()

const matrixMembersSchema = Joi.object({
  chunk: Joi.array().required(),
}).required()

module.exports = class Matrix extends BaseJsonService {
  async fetch({ host, roomId }) {
    const auth = await this._requestJson({
      url: `https://${host}/_matrix/client/r0/register`,
      schema: matrixRegisterSchema,
      options: {
        method: 'POST',
        body: JSON.stringify({
          password: '',
          auth: { type: 'm.login.dummy' },
        }),
      },
      errorMessages: {
        401: 'auth failed',
      },
    })
    const data = await this._requestJson({
      url: `https://${host}/_matrix/client/r0/rooms/${roomId}/members?access_token=${
        auth.access_token
      }`,
      schema: matrixMembersSchema,
      errorMessages: {
        400: 'unknown request',
        401: 'bad auth token',
        403: 'invalid or private room',
      },
    })
    return Array.isArray(data.chunk)
      ? data.chunk.filter(
          m => m.sender === m.state_key && m.content.membership === 'join'
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
        exampleUrl: '!OjvOEGLmupvmEYhadQ/nerdsin.space',
        pattern: ':roomId/:host',
        staticExample: this.render({ members: 42 }),
      },
    ]
  }
}
