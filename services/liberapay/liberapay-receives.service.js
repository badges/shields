import { InvalidResponse } from '../index.js'
import { renderCurrencyBadge, LiberapayBase } from './liberapay-base.js'

export default class LiberapayReceives extends LiberapayBase {
  static route = this.buildRoute('receives')

  static examples = [
    {
      title: 'Liberapay receiving',
      namedParams: { entity: 'Changaco' },
      staticPreview: renderCurrencyBadge({
        label: 'receives',
        amount: '98.32',
        currency: 'EUR',
      }),
    },
  ]

  async handle({ entity }) {
    const data = await this.fetch({ entity })
    if (data.receiving) {
      return renderCurrencyBadge({
        label: 'receives',
        amount: data.receiving.amount,
        currency: data.receiving.currency,
      })
    } else {
      throw new InvalidResponse({ prettyMessage: 'no public receiving stats' })
    }
  }
}
