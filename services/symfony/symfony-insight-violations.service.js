'use strict'

const { SymfonyInsightBase, keywords } = require('./symfony-insight-base')

module.exports = class SymfonyInsightViolations extends SymfonyInsightBase {
  static route = {
    base: 'symfony/i/violations',
    pattern: ':projectUuid',
  }

  static examples = [
    {
      title: 'SymfonyInsight Violations',
      namedParams: {
        projectUuid: '45afb680-d4e6-4e66-93ea-bcfa79eb8a87',
      },
      staticPreview: this.render({
        numViolations: 0,
        status: 'finished',
      }),
      keywords,
    },
  ]

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
