'use strict'

const KeybaseProfile = require('./keybase-profile')
const Joi = require('joi')

const bitcoinAddressSchema = Joi.object({
  them: Joi.array()
    .items(
      Joi.object({
        cryptocurrency_addresses: Joi.object({
          bitcoin: Joi.array().items(
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

module.exports = class KeybaseBTC extends KeybaseProfile {
  static get apiVersion() {
    return '1.0'
  }

  static get category() {
    return 'social'
  }

  static get route() {
    return {
      base: 'keybase/btc',
      pattern: ':username',
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'btc',
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
      schema: bitcoinAddressSchema,
      options,
    })

    if (data.them.length === 0 || !data.them[0]) {
      return {
        message: 'profile not found',
        color: 'critical',
      }
    }

    const bitcoinAddresses = data.them[0].cryptocurrency_addresses.bitcoin

    if (bitcoinAddresses == null || bitcoinAddresses.length === 0) {
      return {
        message: 'no bitcoin addresses found',
        color: 'inactive',
      }
    }

    return this.constructor.render({ address: bitcoinAddresses[0].address })
  }

  static render({ address }) {
    return {
      message: address,
    }
  }

  static get examples() {
    return [
      {
        title: 'Keybase BTC',
        namedParams: { username: 'skyplabs' },
        staticPreview: this.render({
          address: '12ufRLmbEmgjsdGzhUUFY4pcfiQZyRPV9J',
        }),
        keywords: ['bitcoin'],
      },
    ]
  }
}
