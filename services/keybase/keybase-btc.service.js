import Joi from 'joi'
import { pathParams } from '../index.js'
import { nonNegativeInteger } from '../validators.js'
import KeybaseProfile from './keybase-profile.js'

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
            }).required(),
          ),
        })
          .required()
          .allow(null),
      })
        .required()
        .allow(null),
    )
    .min(0)
    .max(1),
}).required()

export default class KeybaseBTC extends KeybaseProfile {
  static route = {
    base: 'keybase/btc',
    pattern: ':username',
  }

  static openApi = {
    '/keybase/btc/{username}': {
      get: {
        summary: 'Keybase BTC',
        parameters: pathParams({
          name: 'username',
          example: 'skyplabs',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'btc',
    color: 'informational',
    namedLogo: 'keybase',
  }

  static render({ address }) {
    return {
      message: address,
      style: 'social',
    }
  }

  static apiVersion = '1.0'

  async handle({ username }) {
    const options = {
      searchParams: {
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
}
