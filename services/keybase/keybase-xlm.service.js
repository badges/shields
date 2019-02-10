'use strict'

const KeybaseProfile = require('./keybase-profile')
const Joi = require('joi')

const stellarAddressFoundSchema = Joi.object({
  them: Joi.array()
    .items(
      Joi.object({
        stellar: {
          primary: {
            account_id: Joi.string().required(),
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

const stellarAddressFoundOrNotFound = Joi.alternatives(
  stellarAddressFoundSchema,
  profileNotFoundSchema
)

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
    return { label: 'xlm' }
  }

  async handle({ username }) {
    const options = {
      method: 'GET',
      form: {
        usernames: username,
        fields: 'stellar',
      },
    }

    const data = await this.fetch({
      schema: stellarAddressFoundOrNotFound,
      options,
    })

    try {
      const address = data.them[0].stellar.primary.account_id
      return this.constructor.render({ address })
    } catch (err) {
      return {
        message: 'not found',
        color: 'inactive',
      }
    }
  }

  static render({ address }) {
    return {
      message: address,
      color: 'informational',
    }
  }

  static get examples() {
    return [
      {
        title: 'Keybase XLM',
        namedParams: { username: 'Keybase username' },
        staticPreview: this.render({
          address: 'GCGH37DYONEBPGAZGCHJEZZF3J2Q3EFYZBQBE6UJL5QKTULCMEA6MXLA',
        }),
        keywords: ['keybase', 'xlm', 'stellar'],
      },
    ]
  }
}
