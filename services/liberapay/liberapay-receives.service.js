'use strict'

const { renderCurrencyBadge, LiberapayBase } = require('./liberapay-base')
const { InvalidResponse } = require('..')

module.exports = class LiberapayReceives extends LiberapayBase {
  static get route() {
    return this.buildRoute('receives')
  }

  static get examples() {
    return [
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
  }

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
