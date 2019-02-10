'use strict'

const { starRating } = require('../../lib/text-formatters')
const {
  SymfonyInsightBase,
  keywords,
  gradeColors,
} = require('./symfony-insight-base')

module.exports = class SymfonyInsightStars extends SymfonyInsightBase {
  static render({ status, grade }) {
    const label = 'stars'
    if (status !== 'finished') {
      return {
        label,
        message: 'pending',
        color: 'lightgrey',
      }
    }
    const numStars = Object.keys(gradeColors).findIndex(g => g === grade)
    return {
      label,
      message: starRating(numStars, 4),
      color: gradeColors[grade],
    }
  }

  static get route() {
    return {
      base: 'symfony/i/stars',
      pattern: ':projectUuid',
    }
  }

  static get examples() {
    return [
      {
        title: 'SymfonyInsight Stars',
        namedParams: {
          projectUuid: '45afb680-d4e6-4e66-93ea-bcfa79eb8a87',
        },
        staticPreview: this.render({
          grade: 'silver',
          status: 'finished',
        }),
        keywords,
      },
    ]
  }

  async handle({ projectUuid }) {
    const data = await this.fetch({ projectUuid })
    const { grade, status } = this.transform({ data })
    return this.constructor.render({ grade, status })
  }
}
