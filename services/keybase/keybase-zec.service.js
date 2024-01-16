import Joi from 'joi'
import { pathParams } from '../index.js'
import { nonNegativeInteger } from '../validators.js'
import KeybaseProfile from './keybase-profile.js'

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

export default class KeybaseZEC extends KeybaseProfile {
  static route = {
    base: 'keybase/zec',
    pattern: ':username',
  }

  static openApi = {
    '/keybase/zec/{username}': {
      get: {
        summary: 'Keybase ZEC',
        parameters: pathParams({
          name: 'username',
          example: 'skyplabs',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'zec',
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
