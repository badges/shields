'use strict'

const Joi = require('@hapi/joi')
const { nonNegativeInteger } = require('../validators')
const KeybaseProfile = require('./keybase-profile')

const keyFingerprintSchema = Joi.object({
  status: Joi.object({
    code: nonNegativeInteger.required(),
  }).required(),
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
    .max(1),
}).required()

module.exports = class KeybasePGP extends KeybaseProfile {
  static get route() {
    return {
      base: 'keybase/pgp',
      pattern: ':username',
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

  static get defaultBadgeData() {
    return {
      label: 'pgp',
      color: 'informational',
    }
  }

  static render({ fingerprint }) {
    return {
      message: fingerprint.slice(-16).toUpperCase(),
    }
  }

  static get apiVersion() {
    return '1.0'
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

    const { user } = this.transform({ data })
    const primaryKey = user.public_keys.primary

    if (primaryKey == null) {
      return {
        message: 'no key fingerprint found',
        color: 'inactive',
      }
    }

    return this.constructor.render({ fingerprint: primaryKey.key_fingerprint })
  }
}
