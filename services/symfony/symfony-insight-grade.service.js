import {
  SymfonyInsightBase,
  keywords,
  gradeColors,
} from './symfony-insight-base.js'

export default class SymfonyInsightGrade extends SymfonyInsightBase {
  static route = {
    base: 'symfony/i/grade',
    pattern: ':projectUuid',
  }

  static examples = [
    {
      title: 'SymfonyInsight Grade',
      namedParams: {
        projectUuid: '825be328-29f8-44f7-a750-f82818ae9111',
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
