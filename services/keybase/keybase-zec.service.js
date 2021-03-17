'use strict'

const Joi = require('joi')
const { nonNegativeInteger } = require('../validators')
const KeybaseProfile = require('./keybase-profile')

const zcachAddressSchema = Joi.object({
  status: Joi.object({
    code: nonNegativeInteger.required(),
  }).required(),
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
    .max(1),
}).required()

module.exports = class KeybaseZEC extends KeybaseProfile {
  static route = {
    base: 'keybase/zec',
    pattern: ':username',
  }

  static examples = [
    {
      title: 'Keybase ZEC',
      namedParams: { username: 'skyplabs' },
      staticPreview: this.render({
        address: 't1RJDxpBcsgqAotqhepkhLFMv2XpMfvnf1y',
      }),
      keywords: ['zcash'],
    },
  ]

  static defaultBadgeData = {
    label: 'zec',
    color: 'informational',
  }

  static render({ address }) {
    return {
      message: address,
    }
  }

  static apiVersion = '1.0'

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

    const { user } = this.transform({ data })
    const zcashAddresses = user.cryptocurrency_addresses.zcash

    if (zcashAddresses == null || zcashAddresses.length === 0) {
      return {
        message: 'no zcash addresses found',
        color: 'inactive',
      }
    }

    return this.constructor.render({ address: zcashAddresses[0].address })
  }
}
