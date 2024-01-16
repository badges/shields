import Joi from 'joi'
import { pathParams } from '../index.js'
import { nonNegativeInteger } from '../validators.js'
import KeybaseProfile from './keybase-profile.js'

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
        .allow(null),
    )
    .min(0)
    .max(1),
}).required()

export default class KeybaseXLM extends KeybaseProfile {
  static route = {
    base: 'keybase/xlm',
    pattern: ':username',
  }

  static openApi = {
    '/keybase/xlm/{username}': {
      get: {
        summary: 'Keybase XLM',
        parameters: pathParams({
          name: 'username',
          example: 'skyplabs',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'xlm',
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
