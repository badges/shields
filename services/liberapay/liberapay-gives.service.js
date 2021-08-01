import { InvalidResponse } from '../index.js'
import { renderCurrencyBadge, LiberapayBase } from './liberapay-base.js'

export default class LiberapayGives extends LiberapayBase {
  static route = this.buildRoute('gives')

  static examples = [
    {
      title: 'Liberapay giving',
      namedParams: { entity: 'Changaco' },
      staticPreview: renderCurrencyBadge({
        label: 'gives',
        amount: '2.58',
        currency: 'EUR',
      }),
    },
  ]

  async handle({ entity }) {
    const data = await this.fetch({ entity })
    if (data.giving) {
      return renderCurrencyBadge({
        label: 'gives',
        amount: data.giving.amount,
        currency: data.giving.currency,
      })
    } else {
      throw new InvalidResponse({ prettyMessage: 'no public giving stats' })
    }
  }
}
