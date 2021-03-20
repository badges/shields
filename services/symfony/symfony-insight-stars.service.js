'use strict'

const { starRating } = require('../text-formatters')
const {
  SymfonyInsightBase,
  keywords,
  gradeColors,
} = require('./symfony-insight-base')

const gradeStars = {
  none: 0,
  bronze: 1,
  silver: 2,
  gold: 3,
  platinum: 4,
}

module.exports = class SymfonyInsightStars extends SymfonyInsightBase {
  static route = {
    base: 'symfony/i/stars',
    pattern: ':projectUuid',
  }

  static examples = [
    {
      title: 'SymfonyInsight Stars',
      namedParams: {
        projectUuid: '15c5c748-f8d8-4b56-b536-a29a151aac6c',
      },
      staticPreview: this.render({
        grade: 'silver',
        status: 'finished',
      }),
      keywords,
    },
  ]

  static render({ status, grade }) {
    const label = 'stars'
    if (status !== 'finished' && status !== '') {
      return {
        label,
        message: 'pending',
        color: 'lightgrey',
      }
    }
    const numStars = gradeStars[grade]
    return {
      label,
      message: starRating(numStars, 4),
      color: gradeColors[grade],
    }
  }

  async handle({ projectUuid }) {
    const data = await this.fetch({ projectUuid })
    const { grade, status } = this.transform({ data })
    return this.constructor.render({ grade, status })
  }
}
