import dayjs from 'dayjs'
import Joi from 'joi'
import { pathParams } from '../index.js'
import { nonNegativeInteger } from '../validators.js'
import {
  renderQuestionsBadge,
  StackExchangeBase,
} from './stackexchange-base.js'

const tagSchema = Joi.object({
  total: nonNegativeInteger,
}).required()

export default class StackExchangeMonthlyQuestions extends StackExchangeBase {
  static route = {
    base: 'stackexchange',
    pattern: ':stackexchangesite/qm/:query',
  }

  static openApi = {
    '/stackexchange/{stackexchangesite}/qm/{query}': {
      get: {
        summary: 'Stack Exchange monthly questions',
        parameters: pathParams(
          {
            name: 'stackexchangesite',
            example: 'stackoverflow',
          },
          {
            name: 'query',
            example: 'dayjs',
          },
        ),
      },
    },
  }

  static render(props) {
    return renderQuestionsBadge({
      suffix: '/month',
      ...props,
    })
  }

  async handle({ stackexchangesite, query }) {
    const today = dayjs().toDate()
    const prevMonthStart = dayjs(today)
      .subtract(1, 'months')
      .startOf('month')
      .unix()
    const prevMonthEnd = dayjs(today)
      .subtract(1, 'months')
      .endOf('month')
      .unix()

    const parsedData = await this.fetch({
      schema: tagSchema,
      options: {
        decompress: true,
        searchParams: {
          site: stackexchangesite,
          fromdate: prevMonthStart,
          todate: prevMonthEnd,
          filter: 'total',
          tagged: query,
        },
      },
      url: 'https://api.stackexchange.com/2.2/questions',
    })

    const numValue = parsedData.total

    return this.constructor.render({
      stackexchangesite,
      query,
      numValue,
    })
  }
}
