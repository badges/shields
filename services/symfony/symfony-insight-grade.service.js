'use strict'

const {
  SymfonyInsightBase,
  keywords,
  gradeColors,
} = require('./symfony-insight-base')

module.exports = class SymfonyInsightGrade extends SymfonyInsightBase {
  static route = {
    base: 'symfony/i/grade',
    pattern: ':projectUuid',
  }

  static examples = [
    {
      title: 'SymfonyInsight Grade',
      namedParams: {
        projectUuid: '15c5c748-f8d8-4b56-b536-a29a151aac6c',
      },
      staticPreview: this.render({
        grade: 'bronze',
        status: 'finished',
      }),
      keywords,
    },
  ]

  static render({ status, grade = 'none' }) {
    const label = 'grade'
    if (status !== 'finished' && status !== '') {
      return {
        label,
        message: 'pending',
        color: 'lightgrey',
      }
    }

    const message = grade === 'none' ? 'no medal' : grade
    return {
      label,
      message,
      color: gradeColors[grade],
    }
  }

  async handle({ projectUuid }) {
    const data = await this.fetch({ projectUuid })
    const { grade, status } = this.transform({ data })

    return this.constructor.render({ grade, status })
  }
}
