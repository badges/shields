'use strict'

const KeybaseProfile = require('./keybase-profile')
const Joi = require('joi')

const bitcoinAddressFoundSchema = Joi.object({
  them: Joi.array()
    .items(
      Joi.object({
        cryptocurrency_addresses: {
          bitcoin: Joi.array()
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

const bitcoinAddressFoundOrNotFound = Joi.alternatives(
  bitcoinAddressFoundSchema,
  profileNotFoundSchema
)

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
    return { label: 'btc' }
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
      schema: bitcoinAddressFoundOrNotFound,
      options,
    })

    try {
      const address = data.them[0].cryptocurrency_addresses.bitcoin[0].address
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
        title: 'Keybase BTC',
        namedParams: { username: 'Keybase username' },
        staticPreview: this.render({
          address: '12ufRLmbEmgjsdGzhUUFY4pcfiQZyRPV9J',
        }),
        keywords: ['bitcoin'],
      },
    ]
  }
}
