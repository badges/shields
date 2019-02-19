'use strict'

const {
  SymfonyInsightBase,
  keywords,
  gradeColors,
} = require('./symfony-insight-base')

module.exports = class SymfonyInsightGrade extends SymfonyInsightBase {
  static render({ status, grade }) {
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

  static get route() {
    return {
      base: 'symfony/i/grade',
      pattern: ':projectUuid',
    }
  }

  static get examples() {
    return [
      {
        title: 'SymfonyInsight Grade',
        namedParams: {
          projectUuid: '45afb680-d4e6-4e66-93ea-bcfa79eb8a87',
        },
        staticPreview: this.render({
          grade: 'bronze',
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
