'use strict'

const { colorScale } = require('../color-formatters')
const { LiberapayBase } = require('./liberapay-base')
const { InvalidResponse } = require('..')

module.exports = class LiberapayGoal extends LiberapayBase {
  static get route() {
    return this.buildRoute('goal')
  }

  static get examples() {
    return [
      {
        title: 'Liberapay goal progress',
        namedParams: { entity: 'Changaco' },
        staticPreview: this.render({ percentAcheived: 33 }),
      },
    ]
  }

  static render({ percentAcheived }) {
    return {
      label: 'goal progress',
      message: `${percentAcheived}%`,
      color: colorScale([0, 10, 100])(percentAcheived),
    }
  }

  async handle({ entity }) {
    const data = await this.fetch({ entity })
    if (data.goal) {
      const percentAcheived = Math.round(
        (data.receiving.amount / data.goal.amount) * 100
      )
      return this.constructor.render({ percentAcheived })
    } else {
      throw new InvalidResponse({ prettyMessage: 'no public goals' })
    }
  }
}
