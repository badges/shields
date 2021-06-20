import { starRating } from '../text-formatters.js'
import {
  SymfonyInsightBase,
  keywords,
  gradeColors,
} from './symfony-insight-base.js'

const gradeStars = {
  none: 0,
  bronze: 1,
  silver: 2,
  gold: 3,
  platinum: 4,
}

export default class SymfonyInsightStars extends SymfonyInsightBase {
  static route = {
    base: 'symfony/i/stars',
    pattern: ':projectUuid',
  }

  static examples = [
    {
      title: 'SymfonyInsight Stars',
      namedParams: {
        projectUuid: '825be328-29f8-44f7-a750-f82818ae9111',
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
