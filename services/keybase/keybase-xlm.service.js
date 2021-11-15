import Joi from 'joi'
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
        .allow(null)
    )
    .min(0)
    .max(1),
}).required()

export default class KeybaseXLM extends KeybaseProfile {
  static route = {
    base: 'keybase/xlm',
    pattern: ':username',
  }

  static examples = [
    {
      title: 'Keybase XLM',
      namedParams: { username: 'skyplabs' },
      staticPreview: this.render({
        address: 'GCGH37DYONEBPGAZGCHJEZZF3J2Q3EFYZBQBE6UJL5QKTULCMEA6MXLA',
      }),
      keywords: ['stellar'],
    },
  ]

  static defaultBadgeData = {
    label: 'xlm',
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
