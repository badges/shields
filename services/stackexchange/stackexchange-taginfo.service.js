import Joi from 'joi'
import { pathParams } from '../index.js'
import {
  renderQuestionsBadge,
  StackExchangeBase,
} from './stackexchange-base.js'

const tagSchema = Joi.object({
  items: Joi.array()
    .length(1)
    .items(
      Joi.object({
        count: Joi.number().min(0).required(),
      }),
    )
    .required(),
}).required()

export default class StackExchangeQuestions extends StackExchangeBase {
  static route = {
    base: 'stackexchange',
    pattern: ':stackexchangesite/t/:query',
  }

  static openApi = {
    '/stackexchange/{stackexchangesite}/t/{query}': {
      get: {
        summary: 'Stack Exchange questions',
        parameters: pathParams(
          {
            name: 'stackexchangesite',
            example: 'stackoverflow',
          },
          {
            name: 'query',
            example: 'gson',
          },
        ),
      },
    },
  }

  static render(props) {
    return renderQuestionsBadge({
      suffix: '',
      ...props,
    })
  }

  async handle({ stackexchangesite, query }) {
    const path = `tags/${query}/info`

    const parsedData = await this.fetch({
      schema: tagSchema,
      options: { decompress: true, searchParams: { site: stackexchangesite } },
      url: `https://api.stackexchange.com/2.2/${path}`,
    })

    const numValue = parsedData.items[0].count

    return this.constructor.render({
      stackexchangesite,
      query,
      numValue,
    })
  }
}
