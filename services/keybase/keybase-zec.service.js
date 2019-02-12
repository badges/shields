'use strict'

const KeybaseProfile = require('./keybase-profile')
const Joi = require('joi')

const zcachAddressSchema = Joi.object({
  them: Joi.array()
    .items(
      Joi.object({
        cryptocurrency_addresses: Joi.object({
          zcash: Joi.array().items(
            Joi.object({
              address: Joi.string().required(),
            }).required()
          ),
        })
          .required()
          .allow(null),
      })
        .required()
        .allow(null)
    )
    .min(0)
    .max(1)
    .required(),
}).required()

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
    return {
      label: 'zec',
      color: 'informational',
    }
  }

  async handle({ username }) {
    const options = {
      form: {
        usernames: username,
        fields: 'cryptocurrency_addresses',
      },
    }

    const data = await this.fetch({
      schema: zcachAddressSchema,
      options,
    })

    if (data.them.length === 0 || !data.them[0]) {
      return {
        message: 'profile not found',
        color: 'critical',
      }
    }

    const zcashAddresses = data.them[0].cryptocurrency_addresses.zcash

    if (zcashAddresses == null || zcashAddresses.length === 0) {
      return {
        message: 'no zcash addresses found',
        color: 'inactive',
      }
    }

    return this.constructor.render({ address: zcashAddresses[0].address })
  }

  static render({ address }) {
    return {
      message: address,
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
