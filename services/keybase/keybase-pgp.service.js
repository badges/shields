'use strict'

const KeybaseProfile = require('./keybase-profile')
const Joi = require('joi')

const keyFingerprintFoundSchema = Joi.object({
  them: Joi.array()
    .items(
      Joi.object({
        public_keys: {
          primary: {
            key_fingerprint: Joi.string()
              .hex()
              .required(),
          },
        },
      }).required()
    )
    .min(0)
    .max(1),
}).required()

const profileNotFoundSchema = Joi.object({
  them: Joi.array().empty(),
}).required()

const keyFingerprintFoundOrNotFound = Joi.alternatives(
  keyFingerprintFoundSchema,
  profileNotFoundSchema
)

module.exports = class KeybasePGP extends KeybaseProfile {
  static get apiVersion() {
    return '1.0'
  }

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
    return {
      label: 'pgp',
      color: 'informational',
    }
  }

  async handle({ username }) {
    const options = {
      method: 'GET',
      form: {
        usernames: username,
        fields: 'public_keys',
      },
    }

    const data = await this.fetch({
      schema: keyFingerprintFoundOrNotFound,
      options,
    })

    try {
      const fingerprint = data.them[0].public_keys.primary.key_fingerprint
      return this.constructor.render({ fingerprint })
    } catch (err) {
      return {
        message: 'not found',
        color: 'inactive',
      }
    }
  }

  static render({ fingerprint }) {
    return {
      message: fingerprint.slice(-16).toUpperCase(),
    }
  }

  static get examples() {
    return [
      {
        title: 'Keybase PGP',
        namedParams: { username: 'Keybase username' },
        staticPreview: this.render({ fingerprint: '1863145FD39EE07E' }),
      },
    ]
  }
}
