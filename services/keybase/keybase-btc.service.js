'use strict'

const KeybaseProfile = require('./keybase-profile')
const Joi = require('joi')
const { nonNegativeInteger } = require('../validators')

const bitcoinAddressSchema = Joi.object({
  status: Joi.object({
    code: nonNegativeInteger.required(),
  }).required(),
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
    .max(1),
}).required()

module.exports = class KeybaseBTC extends KeybaseProfile {
  static get apiVersion() {
    return '1.0'
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

    const { user } = this.transform({ data })
    const bitcoinAddresses = user.cryptocurrency_addresses.bitcoin

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
