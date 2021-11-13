import Joi from 'joi'
import { BaseJsonService } from '../index.js'
import renderQuestionsBadge from './stackexchange-helpers.js'

const tagSchema = Joi.object({
  items: Joi.array()
    .length(1)
    .items(
      Joi.object({
        count: Joi.number().min(0).required(),
      })
    )
    .required(),
}).required()

export default class StackExchangeQuestions extends BaseJsonService {
  static category = 'chat'

  static route = {
    base: 'stackexchange',
    pattern: ':stackexchangesite/t/:query',
  }

  static examples = [
    {
      title: 'Stack Exchange questions',
      namedParams: { stackexchangesite: 'stackoverflow', query: 'gson' },
      staticPreview: this.render({
        stackexchangesite: 'stackoverflow',
        query: 'gson',
        numValue: 10,
      }),
      keywords: ['stackexchange', 'stackoverflow'],
    },
  ]

  static defaultBadgeData = {
    label: 'stackoverflow',
  }

  static render(props) {
    return renderQuestionsBadge({
      suffix: '',
      ...props,
    })
  }

  async handle({ stackexchangesite, query }) {
    const path = `tags/${query}/info`

    const parsedData = await this._requestJson({
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
