'use strict'

const KeybaseProfile = require('./keybase-profile')
const Joi = require('joi')

const keyFingerprintSchema = Joi.object({
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
      })
        .required()
        .allow(null)
    )
    .min(0)
    .max(1)
    .required(),
}).required()

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
      form: {
        usernames: username,
        fields: 'public_keys',
      },
    }

    const data = await this.fetch({
      schema: keyFingerprintSchema,
      options,
    })

    if (data.them.length === 0 || !data.them[0]) {
      return {
        message: 'profile not found',
        color: 'critical',
      }
    }

    const primaryKey = data.them[0].public_keys.primary

    if (primaryKey == null) {
      return {
        message: 'no key fingerprint found',
        color: 'inactive',
      }
    }

    return this.constructor.render({ fingerprint: primaryKey.key_fingerprint })
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
        namedParams: { username: 'skyplabs' },
        staticPreview: this.render({ fingerprint: '1863145FD39EE07E' }),
      },
    ]
  }
}
