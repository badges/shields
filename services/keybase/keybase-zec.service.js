'use strict'

const KeybaseProfile = require('./keybase-profile')
const Joi = require('joi')

const zcachAddressFoundSchema = Joi.object({
  them: Joi.array()
    .items(
      Joi.object({
        cryptocurrency_addresses: {
          zcash: Joi.array()
            .items(
              Joi.object({
                address: Joi.string().required(),
              }).required()
            )
            .required(),
        },
      }).required()
    )
    .min(0)
    .max(1),
}).required()

const profileNotFoundSchema = Joi.object({
  them: Joi.array().empty(),
}).required()

const zcashAddressFoundOrNotFound = Joi.alternatives(
  zcachAddressFoundSchema,
  profileNotFoundSchema
)

module.exports = class KeybaseZEC extends KeybaseProfile {
  static get apiVersion() {
    return '1.0'
  }

  static get category() {
    return 'social'
  }

  static get route() {
    return {
      base: 'keybase/zec',
      pattern: ':username',
    }
  }

  static get defaultBadgeData() {
    return { label: 'zec' }
  }

  async handle({ username }) {
    const options = {
      method: 'GET',
      form: {
        usernames: username,
        fields: 'cryptocurrency_addresses',
      },
    }

    const data = await this.fetch({
      schema: zcashAddressFoundOrNotFound,
      options,
    })

    try {
      const address = data.them[0].cryptocurrency_addresses.zcash[0].address
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
        title: 'Keybase ZEC',
        namedParams: { username: 'Keybase username' },
        staticPreview: this.render({
          address: 't1RJDxpBcsgqAotqhepkhLFMv2XpMfvnf1y',
        }),
        keywords: ['zcash'],
      },
    ]
  }
}
