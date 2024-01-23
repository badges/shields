import { pathParams } from '../index.js'
import { SymfonyInsightBase, description } from './symfony-insight-base.js'

export default class SymfonyInsightViolations extends SymfonyInsightBase {
  static route = {
    base: 'symfony/i/violations',
    pattern: ':projectUuid',
  }

  static openApi = {
    '/symfony/i/violations/{projectUuid}': {
      get: {
        summary: 'SymfonyInsight Violations',
        description,
        parameters: pathParams({
          name: 'projectUuid',
          example: '825be328-29f8-44f7-a750-f82818ae9111',
        }),
      },
    },
  }

  static render({
    status,
    numViolations,
    numCriticalViolations,
    numMajorViolations,
    numMinorViolations,
    numInfoViolations,
  }) {
    const label = 'violations'
    if (status !== 'finished' && status !== '') {
      return {
        label,
        message: 'pending',
        color: 'lightgrey',
      }
    }

    if (numViolations === 0) {
      return {
        label,
        message: '0',
        color: 'brightgreen',
      }
    }

    let color = 'yellowgreen'
    const violationSummary = []

    if (numInfoViolations > 0) {
      violationSummary.push(`${numInfoViolations} info`)
    }
    if (numMinorViolations > 0) {
      violationSummary.unshift(`${numMinorViolations} minor`)
      color = 'yellow'
    }
    if (numMajorViolations > 0) {
      violationSummary.unshift(`${numMajorViolations} major`)
      color = 'orange'
    }
    if (numCriticalViolations > 0) {
      violationSummary.unshift(`${numCriticalViolations} critical`)
      color = 'red'
    }

    return {
      label,
      message: violationSummary.join(', '),
      color,
    }
  }

  async handle({ projectUuid }) {
    const data = await this.fetch({ projectUuid })
    const lastAnalysis = this.transform({ data })
    return this.constructor.render(lastAnalysis)
  }
}
