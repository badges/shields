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
        staticPreview: this.render({ percentAchieved: 33 }),
      },
    ]
  }

  static render({ percentAchieved }) {
    return {
      label: 'goal progress',
      message: `${percentAchieved}%`,
      color: colorScale([0, 10, 100])(percentAchieved),
    }
  }

  transform({ goal, receiving }) {
    if (!goal) {
      throw new InvalidResponse({ prettyMessage: 'no public goals' })
    }

    if (!receiving) {
      return { percentAchieved: 0 }
    }

    const percentAchieved = Math.round((receiving.amount / goal.amount) * 100)

    return { percentAchieved }
  }

  async handle({ entity }) {
    const { goal, receiving } = await this.fetch({ entity })
    const { percentAchieved } = this.transform({ goal, receiving })
    return this.constructor.render({ percentAchieved })
  }
}
