import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { floorCount as floorCountColor } from '../color-formatters.js'
import { StackExchangeBase } from './stackexchange-base.js'

const reputationSchema = Joi.object({
  items: Joi.array()
    .length(1)
    .items(
      Joi.object({
        reputation: Joi.number().min(0).required(),
      })
    )
    .required(),
}).required()

export default class StackExchangeReputation extends StackExchangeBase {
  static route = {
    base: 'stackexchange',
    pattern: ':stackexchangesite/r/:query',
  }

  static examples = [
    {
      title: 'Stack Exchange reputation',
      namedParams: { stackexchangesite: 'stackoverflow', query: '123' },
      staticPreview: this.render({
        stackexchangesite: 'stackoverflow',
        numValue: 10,
      }),
      keywords: ['stackexchange', 'stackoverflow'],
    },
  ]

  static render({ stackexchangesite, numValue }) {
    const label = `${stackexchangesite} reputation`

    return {
      label,
      message: metric(numValue),
      color: floorCountColor(numValue, 1000, 10000, 20000),
    }
  }

  async handle({ stackexchangesite, query }) {
    const path = `users/${query}`

    const parsedData = await this.fetch({
      schema: reputationSchema,
      options: { decompress: true, searchParams: { site: stackexchangesite } },
      url: `https://api.stackexchange.com/2.2/${path}`,
      httpErrors: {
        400: 'invalid parameters',
      },
    })

    const numValue = parsedData.items[0].reputation

    return this.constructor.render({
      stackexchangesite,
      numValue,
    })
  }
}
