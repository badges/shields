'use strict'

const KeybaseProfile = require('./keybase-profile')
const Joi = require('joi')

const stellarAddressSchema = Joi.object({
  them: Joi.array()
    .items(
      Joi.object({
        stellar: Joi.object({
          primary: Joi.object({
            account_id: Joi.string(),
          })
            .required()
            .allow(null),
        }).required(),
      })
        .required()
        .allow(null)
    )
    .min(0)
    .max(1)
    .required(),
}).required()

module.exports = class KeybaseXLM extends KeybaseProfile {
  static get apiVersion() {
    return '1.0'
  }

  static get category() {
    return 'social'
  }

  static get route() {
    return {
      base: 'keybase/xlm',
      pattern: ':username',
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'xlm',
      color: 'informational',
    }
  }

  async handle({ username }) {
    const options = {
      form: {
        usernames: username,
        fields: 'stellar',
      },
    }

    const data = await this.fetch({
      schema: stellarAddressSchema,
      options,
    })

    if (data.them.length === 0 || !data.them[0]) {
      return {
        message: 'profile not found',
        color: 'critical',
      }
    }

    const accountId = data.them[0].stellar.primary.account_id

    if (accountId == null) {
      return {
        message: 'no stellar address found',
        color: 'inactive',
      }
    }

    return this.constructor.render({ address: accountId })
  }

  static render({ address }) {
    return {
      message: address,
    }
  }

  static get examples() {
    return [
      {
        title: 'Keybase XLM',
        namedParams: { username: 'skyplabs' },
        staticPreview: this.render({
          address: 'GCGH37DYONEBPGAZGCHJEZZF3J2Q3EFYZBQBE6UJL5QKTULCMEA6MXLA',
        }),
        keywords: ['stellar'],
      },
    ]
  }
}
