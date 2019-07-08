'use strict'

const { renderCurrencyBadge, LiberapayBase } = require('./liberapay-base')
const { InvalidResponse } = require('..')

module.exports = class LiberapayGives extends LiberapayBase {
  static get route() {
    return this.buildRoute('gives')
  }

  static get examples() {
    return [
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
  }

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
