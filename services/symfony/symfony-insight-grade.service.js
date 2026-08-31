import { pathParams } from '../index.js'
import {
  SymfonyInsightBase,
  description,
  gradeColors,
} from './symfony-insight-base.js'

export default class SymfonyInsightGrade extends SymfonyInsightBase {
  static route = {
    base: 'symfony/i/grade',
    pattern: ':projectUuid',
  }

  static openApi = {
    '/symfony/i/grade/{projectUuid}': {
      get: {
        summary: 'SymfonyInsight Grade',
        description,
        parameters: pathParams({
          name: 'projectUuid',
          example: 'a92cacf2-ba32-4f36-b040-5a9f1d7f8f25',
        }),
      },
    },
  }

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
