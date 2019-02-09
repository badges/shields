'use strict'

const { BaseJsonService } = require('..')

const Joi = require('joi')
const schema = Joi.object({
  them: Joi.array().items(
    Joi.object({
      public_keys: {
        primary: {
          key_fingerprint: Joi.string().required(),
        },
      },
    })
  ),
}).required()

module.exports = class KeybasePGP extends BaseJsonService {
  static get category() {
    return 'social'
  }

  static get route() {
    return {
      base: 'keybase/pgp',
      pattern: ':username',
    }
  }

  static get defaultBadgeData() {
    return { label: 'pgp' }
  }

  async handle({ username }) {
    const data = await this.fetch({ username })

    try {
      const fingerprint = data.them[0].public_keys.primary.key_fingerprint
      return this.constructor.render(fingerprint)
    } catch (err) {
      return {
        message: 'not found',
        color: 'inactive',
      }
    }
  }

  async fetch({ username }) {
    return this._requestJson({
      schema,
      url: `https://keybase.io/_/api/1.0/user/lookup.json?usernames=${username}`,
    })
  }

  static render(fingerprint) {
    return {
      message: `${fingerprint}`,
      color: 'informational',
    }
  }
}
