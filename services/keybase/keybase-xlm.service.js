'use strict'

const Joi = require('@hapi/joi')
const { nonNegativeInteger } = require('../validators')
const KeybaseProfile = require('./keybase-profile')

const stellarAddressSchema = Joi.object({
  status: Joi.object({
    code: nonNegativeInteger.required(),
  }).required(),
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
    .max(1),
}).required()

module.exports = class KeybaseXLM extends KeybaseProfile {
  static get route() {
    return {
      base: 'keybase/xlm',
      pattern: ':username',
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

  static get defaultBadgeData() {
    return {
      label: 'xlm',
      color: 'informational',
    }
  }

  static render({ address }) {
    return {
      message: address,
    }
  }

  static get apiVersion() {
    return '1.0'
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

    const { user } = this.transform({ data })
    const accountId = user.stellar.primary.account_id

    if (accountId == null) {
      return {
        message: 'no stellar address found',
        color: 'inactive',
      }
    }

    return this.constructor.render({ address: accountId })
  }
}
