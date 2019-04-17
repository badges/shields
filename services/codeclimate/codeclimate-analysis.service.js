'use strict'

const Joi = require('joi')
const { BaseJsonService, NotFound } = require('..')
const { colorScale } = require('../color-formatters')
const { keywords, fetchRepo } = require('./codeclimate-common')

const schema = Joi.object().required()

const maintainabilityColorScale = colorScale(
  [50, 80, 90, 95],
  ['red', 'yellow', 'yellowgreen', 'green', 'brightgreen']
)
const issueColorScale = colorScale(
  [1, 5, 10, 20],
  ['brightgreen', 'green', 'yellowgreen', 'yellow', 'red']
)
const techDebtColorScale = colorScale(
  [5, 10, 20, 50],
  ['brightgreen', 'green', 'yellowgreen', 'yellow', 'red']
)

module.exports = class CodeclimateAnalysis extends BaseJsonService {
  static get route() {
    return {
      base: 'codeclimate',
      pattern:
        ':which(maintainability|maintainability-percentage|issues|tech-debt)/:user/:repo',
    }
  }

  static get category() {
    return 'analysis'
  }

  static get examples() {
    return [
      {
        title: 'Code Climate maintainability',
        pattern: 'maintainability/:userRepo',
        namedParams: { userRepo: 'angular/angular.js' },
        staticPreview: { label: 'maintainability', message: 'F', color: 'red' },
      },
      {
        title: 'Code Climate maintainability (percentage)',
        pattern: 'maintainability-percentage/:userRepo',
        namedParams: { userRepo: 'angular/angular.js' },
        staticPreview: {
          label: 'maintainability',
          message: '4.6%',
          color: 'red',
        },
      },
      {
        title: 'Code Climate issues',
        pattern: 'issues/:userRepo',
        namedParams: { userRepo: 'twbs/bootstrap' },
        staticPreview: { label: 'issues', message: '89', color: 'red' },
      },
      {
        title: 'Code Climate technical debt',
        pattern: 'tech-debt/:userRepo',
        namedParams: { userRepo: 'jekyll/jekyll' },
        staticPreview: {
          label: 'technical debt',
          message: '3%',
          color: 'brightgreen',
        },
      },
    ]
  }

  async fetch({ user, repo }) {
    const {
      id: repoId,
      relationships: {
        latest_default_branch_snapshot: { data: testReportInfo },
      },
    } = await fetchRepo(this, { user, repo })
    if (testReportInfo === null) {
      throw new NotFound({ prettyMessage: 'test report not found' })
    }
    const { data } = await this._requestJson({
      schema,
      url: `https://api.codeclimate.com/v1/repos/${repoId}/snapshots/${
        testReportInfo.id
      }`,
      errorMessages: { 404: 'test report not found' },
    })
    return data
  }

  static render({ wantPercentage, percentage, letter }) {
    if (wantPercentage) {
      return {
        message: letter,
        color: letterScore(letter),
      }
    } else {
      return {
        message: `${percentage.toFixed(0)}%`,
        color: coveragePercentage(percentage),
      }
    }
  }

  async handle({ which, user, repo }) {
    const {
      attributes: {
        rating: { letter },
        covered_percent: percentage,
      },
    } = await this.fetch({ user, repo })

    return this.constructor.render({
      wantLetter: which === 'coverage-letter',
      letter,
      percentage,
    })
  }
}
