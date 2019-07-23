'use strict'

const Joi = require('@hapi/joi')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { GithubAuthV3Service } = require('./github-auth-service')
const { errorMessagesFor, documentation } = require('./github-helpers')

const schema = Joi.array()
  .items(
    Joi.object({
      total: nonNegativeInteger,
    })
  )
  .required()

module.exports = class GithubCommitActivity extends GithubAuthV3Service {
  static get category() {
    return 'activity'
  }

  static get route() {
    return {
      base: 'github/commit-activity',
      pattern: ':interval(y|m|4w|w)/:user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub commit activity',
        // Override the pattern to omit the deprecated interval "4w".
        pattern: ':interval(y|m|w)/:user/:repo',
        namedParams: { interval: 'm', user: 'eslint', repo: 'eslint' },
        staticPreview: this.render({ interval: 'm', commitCount: 457 }),
        keywords: ['commits'],
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'commit activity',
      color: 'blue',
    }
  }

  static render({ interval, commitCount }) {
    const intervalLabel = {
      y: '/year',
      m: '/month',
      '4w': '/four weeks',
      w: '/week',
    }[interval]

    return {
      message: `${metric(commitCount)}${intervalLabel}`,
    }
  }

  static transform({ interval, weekData }) {
    const weekTotals = weekData.map(({ total }) => total)

    if (interval === 'm') {
      // To approximate the value for the past month, get the sum for the last
      // four weeks and add a weighted value for the fifth week.
      const fourWeeksValue = weekTotals
        .slice(-4)
        .reduce((sum, weekTotal) => sum + weekTotal, 0)
      const fifthWeekValue = weekTotals.slice(-5)[0]
      const averageWeeksPerMonth = 365 / 12 / 7
      return (
        fourWeeksValue + Math.round((averageWeeksPerMonth - 4) * fifthWeekValue)
      )
    }

    let wantedWeekData
    switch (interval) {
      case 'y':
        wantedWeekData = weekTotals
        break
      case '4w':
        wantedWeekData = weekTotals.slice(-4)
        break
      case 'w':
        wantedWeekData = weekTotals.slice(-2, -1)
        break
      default:
        throw Error('Unhandled case')
    }

    return wantedWeekData.reduce((sum, weekTotal) => sum + weekTotal, 0)
  }

  async handle({ interval, user, repo }) {
    const weekData = await this._requestJson({
      url: `/repos/${user}/${repo}/stats/commit_activity`,
      schema,
      errorMessages: errorMessagesFor(),
    })
    const commitCount = this.constructor.transform({ interval, weekData })
    return this.constructor.render({ interval, commitCount })
  }
}
